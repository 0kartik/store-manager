const express = require('express');
const pool = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRating } = require('../utils/validators');

const router = express.Router();
router.use(authenticate, authorize('USER'));

// List/search stores with overall rating + this user's own submitted rating
router.get('/stores', async (req, res) => {
  const { name = '', address = '', sortBy = 'name', order = 'asc' } = req.query;
  const allowed = ['name', 'address', 'overall_rating'];
  const col = allowed.includes(sortBy) ? sortBy : 'name';
  const direction = order === 'desc' ? 'DESC' : 'ASC';

  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.address,
              COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS overall_rating,
              ur.rating AS user_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $1
       WHERE s.name ILIKE $2 AND s.address ILIKE $3
       GROUP BY s.id, ur.rating
       ORDER BY ${col === 'overall_rating' ? 'overall_rating' : 's.' + col} ${direction}`,
      [req.user.id, `%${name}%`, `%${address}%`]
    );
    res.json({ stores: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching stores' });
  }
});

// Submit a new rating
router.post('/ratings', async (req, res) => {
  const { storeId, rating } = req.body;
  const error = validateRating(rating);
  if (error) return res.status(400).json({ message: error });

  try {
    const store = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (!store.rows.length) return res.status(404).json({ message: 'Store not found' });

    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
       RETURNING id, user_id, store_id, rating`,
      [req.user.id, storeId, rating]
    );
    res.status(201).json({ rating: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error submitting rating' });
  }
});

// Modify an existing rating explicitly via PUT
router.put('/ratings/:storeId', async (req, res) => {
  const { rating } = req.body;
  const error = validateRating(rating);
  if (error) return res.status(400).json({ message: error });

  try {
    const result = await pool.query(
      `UPDATE ratings SET rating = $1, updated_at = NOW()
       WHERE user_id = $2 AND store_id = $3
       RETURNING id, user_id, store_id, rating`,
      [rating, req.user.id, req.params.storeId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'No existing rating to update — submit one first' });
    }
    res.json({ rating: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating rating' });
  }
});

module.exports = router;
