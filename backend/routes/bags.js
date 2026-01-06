const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all user's bags
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bags_with_weight WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get bags error:', error);
    res.status(500).json({ error: 'Failed to get bags' });
  }
});

// Get single bag with all items
router.get('/:id', async (req, res) => {
  try {
    const bagResult = await pool.query(
      'SELECT * FROM bags_with_weight WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (bagResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bag not found' });
    }

    const bag = bagResult.rows[0];

    const itemsResult = await pool.query(
      'SELECT * FROM bag_contents WHERE bag_id = $1 ORDER BY category, brand, model',
      [req.params.id]
    );

    bag.items = itemsResult.rows;
    res.json(bag);
  } catch (error) {
    console.error('Get bag error:', error);
    res.status(500).json({ error: 'Failed to get bag' });
  }
});

// Create new bag
router.post('/', async (req, res) => {
  try {
    const { name, backpack_gear_item_id, description } = req.body;

    if (!name || !backpack_gear_item_id) {
      return res.status(400).json({ error: 'Name and backpack required' });
    }

    const backpackCheck = await pool.query(
      "SELECT id FROM gear_items WHERE id = $1 AND category = 'backpack'",
      [backpack_gear_item_id]
    );

    if (backpackCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid backpack gear item' });
    }

    const result = await pool.query(
      `INSERT INTO bags (user_id, name, backpack_gear_item_id, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.userId, name, backpack_gear_item_id, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create bag error:', error);
    res.status(500).json({ error: 'Failed to create bag' });
  }
});

// Update bag
router.put('/:id', async (req, res) => {
  try {
    const { name, backpack_gear_item_id, description } = req.body;

    const result = await pool.query(
      `UPDATE bags 
       SET name = COALESCE($1, name),
           backpack_gear_item_id = COALESCE($2, backpack_gear_item_id),
           description = COALESCE($3, description),
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [name, backpack_gear_item_id, description, req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bag not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update bag error:', error);
    res.status(500).json({ error: 'Failed to update bag' });
  }
});

// Delete bag
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM bags WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bag not found' });
    }

    res.json({ message: 'Bag deleted' });
  } catch (error) {
    console.error('Delete bag error:', error);
    res.status(500).json({ error: 'Failed to delete bag' });
  }
});

// Duplicate bag
router.post('/:id/duplicate', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bagResult = await client.query(
      'SELECT * FROM bags WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (bagResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Bag not found' });
    }

    const originalBag = bagResult.rows[0];
    const newName = req.body.name || `${originalBag.name} (copy)`;

    const newBagResult = await client.query(
      `INSERT INTO bags (user_id, name, backpack_gear_item_id, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.userId, newName, originalBag.backpack_gear_item_id, originalBag.description]
    );

    const newBag = newBagResult.rows[0];

    await client.query(
      `INSERT INTO bag_items (bag_id, gear_item_id, quantity, override_weight_grams)
       SELECT $1, gear_item_id, quantity, override_weight_grams
       FROM bag_items
       WHERE bag_id = $2`,
      [newBag.id, req.params.id]
    );

    await client.query('COMMIT');

    const completeResult = await pool.query(
      'SELECT * FROM bags_with_weight WHERE id = $1',
      [newBag.id]
    );

    res.status(201).json(completeResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Duplicate bag error:', error);
    res.status(500).json({ error: 'Failed to duplicate bag' });
  } finally {
    client.release();
  }
});

// Add item to bag
router.post('/:id/items', async (req, res) => {
  try {
    const { gear_item_id, quantity = 1, override_weight_grams } = req.body;

    const bagCheck = await pool.query(
      'SELECT id FROM bags WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (bagCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Bag not found' });
    }

    const result = await pool.query(
      `INSERT INTO bag_items (bag_id, gear_item_id, quantity, override_weight_grams)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (bag_id, gear_item_id) 
       DO UPDATE SET quantity = bag_items.quantity + $3,
                     override_weight_grams = COALESCE($4, bag_items.override_weight_grams)
       RETURNING *`,
      [req.params.id, gear_item_id, quantity, override_weight_grams]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add bag item error:', error);
    res.status(500).json({ error: 'Failed to add item to bag' });
  }
});

// Remove item from bag
router.delete('/:bagId/items/:itemId', async (req, res) => {
  try {
    const bagCheck = await pool.query(
      'SELECT id FROM bags WHERE id = $1 AND user_id = $2',
      [req.params.bagId, req.user.userId]
    );

    if (bagCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Bag not found' });
    }

    const result = await pool.query(
      'DELETE FROM bag_items WHERE bag_id = $1 AND gear_item_id = $2 RETURNING id',
      [req.params.bagId, req.params.itemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not in bag' });
    }

    res.json({ message: 'Item removed from bag' });
  } catch (error) {
    console.error('Remove bag item error:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

module.exports = router;