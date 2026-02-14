const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all gear (with optional search and category filter)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, category, limit, offset, owned } = req.query;
    
    let query = 'SELECT * FROM gear_items WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      const searchTerm = search.trim().replace(/\s+/g, ' ');
      const searchPattern = '%' + searchTerm + '%';
      query += ` AND (
        search_vector @@ plainto_tsquery('english', $${paramCount})
        OR brand ILIKE $${paramCount + 1}
        OR model ILIKE $${paramCount + 1}
      )`;
      params.push(searchTerm, searchPattern);
      paramCount += 2;
    }

    if (owned === 'true') {
      query += ` AND id IN (SELECT gear_item_id FROM user_gear_ownership WHERE user_id = $${paramCount})`;
      params.push(req.user.userId);
      paramCount++;
    }

    query += ' ORDER BY category, brand, model';
    
    // Always apply limit if provided (default to reasonable limit to prevent loading all items)
    const limitValue = limit ? parseInt(limit) : 20;
    query += ` LIMIT $${paramCount}`;
    params.push(limitValue);
    paramCount++;
    
    // Apply offset if provided (0 is valid for first page)
    const offsetValue = offset ? parseInt(offset) : 0;
    if (offsetValue > 0) {
      query += ` OFFSET $${paramCount}`;
      params.push(offsetValue);
      paramCount++;
    }

    const result = await pool.query(query, params);
    
    let countQuery = 'SELECT COUNT(*) FROM gear_items WHERE 1=1';
    const countParams = [];
    let countParamNum = 1;
    
    if (category) {
      countQuery += ` AND category = $${countParamNum}`;
      countParams.push(category);
      countParamNum++;
    }
    
    if (search) {
      const searchTerm = search.trim().replace(/\s+/g, ' ');
      const searchPattern = '%' + searchTerm + '%';
      countQuery += ` AND (
        search_vector @@ plainto_tsquery('english', $${countParamNum})
        OR brand ILIKE $${countParamNum + 1}
        OR model ILIKE $${countParamNum + 1}
      )`;
      countParams.push(searchTerm, searchPattern);
      countParamNum += 2;
    }

    if (owned === 'true') {
      countQuery += ` AND id IN (SELECT gear_item_id FROM user_gear_ownership WHERE user_id = $${countParamNum})`;
      countParams.push(req.user.userId);
      countParamNum++;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      items: result.rows,
      total,
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : 0
    });
  } catch (error) {
    console.error('Get gear error:', error);
    res.status(500).json({ error: 'Failed to get gear' });
  }
});

// Get just backpacks
router.get('/backpacks', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM gear_items WHERE category = 'backpack' ORDER BY brand, model"
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

// Get single gear item
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM gear_items WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gear item not found' });
    }

    res.json(result.rows[0]);
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
      'SELECT id FROM gear_items WHERE id = $1',
      [gearItemId]
    );
    if (gearCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Gear item not found' });
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