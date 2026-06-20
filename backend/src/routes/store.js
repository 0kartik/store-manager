const express = require('express');
const pool = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('STORE_OWNER'));

// Dashboard: users who rated this owner's store(s) + average rating
router.get('/dashboard', async (req, res) => {
  try {
    const storeRes = await pool.query('SELECT id, name FROM stores WHERE owner_id = $1', [req.user.id]);
    if (!storeRes.rows.length) {
      return res.json({ store: null, averageRating: 0, raters: [] });
    }
    const store = storeRes.rows[0];

    const ratersRes = await pool.query(
      `SELECT u.id, u.name, u.email, r.rating, r.created_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [store.id]
    );

    const avgRes = await pool.query(
      'SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS avg FROM ratings WHERE store_id = $1',
      [store.id]
    );

    res.json({
      store,
      averageRating: Number(avgRes.rows[0].avg),
      raters: ratersRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching dashboard' });
  }
});

module.exports = router;
