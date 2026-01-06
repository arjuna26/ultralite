const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get all gear (with optional search and category filter)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let query = 'SELECT * FROM gear_items WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      query += ` AND (brand ILIKE $${paramCount} OR model ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY category, brand, model';

    const result = await pool.query(query, params);
    res.json(result.rows);
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

module.exports = router;