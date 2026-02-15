const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper: build WHERE clause for gear queries
function buildGearWhereClause(userId, { search, category, owned }) {
  const conditions = ['(user_id IS NULL OR user_id = $1)'];
  const params = [userId];
  let idx = 2;

  if (category) {
    conditions.push(`category = $${idx++}`);
    params.push(category);
  }
  if (search) {
    const term = search.trim().replace(/\s+/g, ' ');
    const pattern = `%${term}%`;
    conditions.push(`(search_vector @@ plainto_tsquery('english', $${idx}) OR brand ILIKE $${idx + 1} OR model ILIKE $${idx + 1})`);
    params.push(term, pattern);
    idx += 2;
  }
  if (owned === 'true') {
    conditions.push(`id IN (SELECT gear_item_id FROM user_gear_ownership WHERE user_id = $${idx++})`);
    params.push(userId);
  }
  return { where: conditions.join(' AND '), params, nextIdx: idx };
}

// Get all gear (with optional search, category, owned filter)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, category, limit, offset, owned } = req.query;
    const { where, params, nextIdx } = buildGearWhereClause(req.user.userId, { search, category, owned });

    let idx = nextIdx;
    const limitVal = limit ? parseInt(limit) : 20;
    const offsetVal = offset ? parseInt(offset) : 0;

    let query = `SELECT * FROM gear_items WHERE ${where} ORDER BY category, brand, model LIMIT $${idx++}`;
    params.push(limitVal);
    if (offsetVal > 0) {
      query += ` OFFSET $${idx++}`;
      params.push(offsetVal);
    }

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(`SELECT COUNT(*) FROM gear_items WHERE ${where}`, params.slice(0, nextIdx - 1))
    ]);

    res.json({
      items: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: limit ? parseInt(limit) : null,
      offset: offsetVal
    });
  } catch (error) {
    console.error('Get gear error:', error);
    res.status(500).json({ error: 'Failed to get gear' });
  }
});

// Get just backpacks
router.get('/backpacks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM gear_items WHERE category = 'backpack' AND (user_id IS NULL OR user_id = $1) ORDER BY brand, model",
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get backpacks error:', error);
    res.status(500).json({ error: 'Failed to get backpacks' });
  }
});

// ============================================
// PROTECTED ROUTES
// ============================================

// Get user's owned gear
router.get('/owned', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_gear_ownership WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get owned gear error:', error);
    res.status(500).json({ error: 'Failed to get owned gear' });
  }
});

// Create custom gear
router.post('/custom', authenticateToken, async (req, res) => {
  try {
    const { brand, model, category, weight_grams, subcategory, capacity, materials, weight_source } = req.body;
    if (!brand || !model || !category || weight_grams == null || weight_grams < 1) {
      return res.status(400).json({ error: 'brand, model, category, and weight_grams (positive) required' });
    }
    const ws = weight_source || 'estimated';
    const result = await pool.query(
      `INSERT INTO gear_items (
        user_id, brand, model, category, subcategory, weight_grams, weight_source,
        capacity, materials, image_url, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, 'manual')
      RETURNING *`,
      [req.user.userId, brand, model, category, subcategory || null, weight_grams, ws, capacity || null, materials || null]
    );
    const newItem = result.rows[0];
    await pool.query(
      'INSERT INTO user_gear_ownership (user_id, gear_item_id) VALUES ($1, $2) ON CONFLICT (user_id, gear_item_id) DO NOTHING',
      [req.user.userId, newItem.id]
    );
    res.status(201).json(newItem);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'You already have a custom item with this brand and model' });
    console.error(err);
    res.status(500).json({ error: 'Failed to create custom gear' });
  }
});

// Update custom gear (protected)
router.put('/custom/:id', authenticateToken, async (req, res) => {
  try {
    const { brand, model, category, weight_grams, subcategory, capacity, materials, weight_source } = req.body;
    const result = await pool.query(
      `UPDATE gear_items SET
        brand = COALESCE($2, brand), model = COALESCE($3, model), category = COALESCE($4, category),
        weight_grams = COALESCE($5, weight_grams), subcategory = COALESCE($6, subcategory),
        capacity = COALESCE($7, capacity), materials = COALESCE($8, materials),
        weight_source = COALESCE($9, weight_source), updated_at = NOW()
      WHERE id = $1 AND user_id = $10
      RETURNING *`,
      [req.params.id, brand, model, category, weight_grams, subcategory, capacity, materials, weight_source, req.user.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Custom gear not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'You already have a custom item with this brand and model' });
    console.error(err);
    res.status(500).json({ error: 'Failed to update custom gear' });
  }
});

// Delete custom gear (protected)
router.delete('/custom/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM gear_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Custom gear not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Cannot delete: gear is used in one or more bags' });
    console.error(err);
    res.status(500).json({ error: 'Failed to delete custom gear' });
  }
});

// Get single gear item (404 if custom and not owner)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM gear_items WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gear item not found' });
    }
    const row = result.rows[0];
    if (row.user_id) {
      if (!req.user || req.user.userId !== row.user_id) {
        return res.status(404).json({ error: 'Gear item not found' });
      }
    }
    res.json(row);
  } catch (error) {
    console.error('Get gear item error:', error);
    res.status(500).json({ error: 'Failed to get gear item' });
  }
});

// Toggle gear ownership (add if not owned, remove if owned)
router.post('/:id/toggle-owned', authenticateToken, async (req, res) => {
  try {
    const gearItemId = req.params.id;
    const userId = req.user.userId;

    // Check if gear item exists
    const gearCheck = await pool.query(
      'SELECT id, user_id FROM gear_items WHERE id = $1',
      [gearItemId]
    );
    if (gearCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Gear item not found' });
    }
    if (gearCheck.rows[0].user_id) {
      return res.status(400).json({ error: 'Cannot toggle ownership for custom gear' });
    }

    // Check if user already owns this gear
    const ownershipCheck = await pool.query(
      'SELECT id FROM user_gear_ownership WHERE user_id = $1 AND gear_item_id = $2',
      [userId, gearItemId]
    );

    if (ownershipCheck.rows.length > 0) {
      // Remove ownership
      await pool.query(
        'DELETE FROM user_gear_ownership WHERE user_id = $1 AND gear_item_id = $2',
        [userId, gearItemId]
      );
      res.json({ owned: false, gear_item_id: gearItemId });
    } else {
      // Add ownership
      await pool.query(
        'INSERT INTO user_gear_ownership (user_id, gear_item_id) VALUES ($1, $2)',
        [userId, gearItemId]
      );
      res.json({ owned: true, gear_item_id: gearItemId });
    }
  } catch (error) {
    console.error('Toggle gear ownership error:', error);
    res.status(500).json({ error: 'Failed to toggle gear ownership' });
  }
});

module.exports = router;