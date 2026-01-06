const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all user's trips
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trips WHERE user_id = $1 ORDER BY start_date DESC NULLS LAST, created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to get trips' });
  }
});

// Get single trip with bags and stats
router.get('/:id', async (req, res) => {
  try {
    const tripResult = await pool.query(
      'SELECT * FROM trips WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const trip = tripResult.rows[0];

    const bagsResult = await pool.query(
      `SELECT b.*, bw.total_weight_grams, bw.backpack_brand, bw.backpack_model, tb.role
       FROM trip_bags tb
       JOIN bags b ON tb.bag_id = b.id
       JOIN bags_with_weight bw ON b.id = bw.id
       WHERE tb.trip_id = $1`,
      [req.params.id]
    );

    trip.bags = bagsResult.rows;

    const statsResult = await pool.query(
      'SELECT * FROM trip_stats WHERE trip_id = $1',
      [req.params.id]
    );

    trip.stats = statsResult.rows[0] || null;

    res.json(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Failed to get trip' });
  }
});

// Create trip
router.post('/', async (req, res) => {
  try {
    const { name, location_text, start_date, end_date, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Trip name required' });
    }

    const result = await pool.query(
      `INSERT INTO trips (user_id, name, location_text, start_date, end_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.userId, name, location_text, start_date, end_date, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// Update trip
router.put('/:id', async (req, res) => {
  try {
    const { name, location_text, start_date, end_date, notes } = req.body;

    const result = await pool.query(
      `UPDATE trips
       SET name = COALESCE($1, name),
           location_text = COALESCE($2, location_text),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           notes = COALESCE($5, notes)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, location_text, start_date, end_date, notes, req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Delete trip
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ message: 'Trip deleted' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// Associate bag with trip
router.post('/:id/bags', async (req, res) => {
  try {
    const { bag_id, role = 'primary' } = req.body;

    const tripCheck = await pool.query(
      'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    const bagCheck = await pool.query(
      'SELECT id FROM bags WHERE id = $1 AND user_id = $2',
      [bag_id, req.user.userId]
    );

    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (bagCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Bag not found' });
    }

    const result = await pool.query(
      `INSERT INTO trip_bags (trip_id, bag_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (trip_id, bag_id) DO UPDATE SET role = $3
       RETURNING *`,
      [req.params.id, bag_id, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add trip bag error:', error);
    res.status(500).json({ error: 'Failed to add bag to trip' });
  }
});

// Remove bag from trip
router.delete('/:tripId/bags/:bagId', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM trip_bags 
       WHERE trip_id = $1 AND bag_id = $2
       AND EXISTS (SELECT 1 FROM trips WHERE id = $1 AND user_id = $3)
       RETURNING id`,
      [req.params.tripId, req.params.bagId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Association not found' });
    }

    res.json({ message: 'Bag removed from trip' });
  } catch (error) {
    console.error('Remove trip bag error:', error);
    res.status(500).json({ error: 'Failed to remove bag from trip' });
  }
});

// Update or create trip stats
router.put('/:id/stats', async (req, res) => {
  try {
    const { nights, miles, elevation_gain_ft, weather_notes, lessons_learned } = req.body;

    const tripCheck = await pool.query(
      'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const result = await pool.query(
      `INSERT INTO trip_stats (trip_id, nights, miles, elevation_gain_ft, weather_notes, lessons_learned)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (trip_id) DO UPDATE
       SET nights = COALESCE($2, trip_stats.nights),
           miles = COALESCE($3, trip_stats.miles),
           elevation_gain_ft = COALESCE($4, trip_stats.elevation_gain_ft),
           weather_notes = COALESCE($5, trip_stats.weather_notes),
           lessons_learned = COALESCE($6, trip_stats.lessons_learned)
       RETURNING *`,
      [req.params.id, nights, miles, elevation_gain_ft, weather_notes, lessons_learned]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update trip stats error:', error);
    res.status(500).json({ error: 'Failed to update trip stats' });
  }
});

module.exports = router;