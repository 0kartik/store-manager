const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} = require('../utils/validators');

const router = express.Router();
router.use(authenticate, authorize('ADMIN'));

const ALLOWED_USER_SORT = ['name', 'email', 'address', 'role'];
const ALLOWED_STORE_SORT = ['name', 'email', 'address', 'rating'];

function sortClause(field, dir, allowed, fallback) {
  const col = allowed.includes(field) ? field : fallback;
  const direction = dir === 'desc' ? 'DESC' : 'ASC';
  return { col, direction };
}

// ---- Dashboard stats ----
router.get('/dashboard', async (req, res) => {
  try {
    const [{ rows: u }, { rows: s }, { rows: r }] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM stores'),
      pool.query('SELECT COUNT(*) FROM ratings'),
    ]);
    res.json({
      totalUsers: Number(u[0].count),
      totalStores: Number(s[0].count),
      totalRatings: Number(r[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- Create user (any role) ----
router.post('/users', async (req, res) => {
  const { name, email, address, password, role } = req.body;
  const allowedRoles = ['ADMIN', 'USER', 'STORE_OWNER'];

  const errors = [
    validateName(name),
    validateEmail(email),
    validateAddress(address),
    validatePassword(password),
  ].filter(Boolean);

  if (!allowedRoles.includes(role)) errors.push('Invalid role');
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role`,
      [name, email, hashed, address, role]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

// ---- Create store ----
router.post('/stores', async (req, res) => {
  const { name, email, address, ownerId } = req.body;

  const errors = [validateAddress(address), validateEmail(email)].filter(Boolean);
  if (!name || name.length > 60) errors.push('Store name is required (max 60 chars)');
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  try {
    if (ownerId) {
      const owner = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'STORE_OWNER'",
        [ownerId]
      );
      if (!owner.rows.length) {
        return res.status(400).json({ message: 'ownerId must reference a STORE_OWNER user' });
      }
    }

    const existing = await pool.query('SELECT id FROM stores WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(409).json({ message: 'Store email already in use' });

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id`,
      [name, email, address, ownerId || null]
    );
    res.status(201).json({ store: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating store' });
  }
});

// ---- List stores with filters + sort + avg rating ----
router.get('/stores', async (req, res) => {
  const { name = '', email = '', address = '', sortBy = 'name', order = 'asc' } = req.query;
  const { col, direction } = sortClause(sortBy, order, ALLOWED_STORE_SORT, 'name');

  // Map 'rating' to the aggregated alias for ORDER BY safety
  const orderExpr = col === 'rating' ? 'rating' : `s.${col}`;

  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.name ILIKE $1 AND s.email ILIKE $2 AND s.address ILIKE $3
       GROUP BY s.id
       ORDER BY ${orderExpr} ${direction}`,
      [`%${name}%`, `%${email}%`, `%${address}%`]
    );
    res.json({ stores: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching stores' });
  }
});

// ---- List users (normal + admin + store owner) with filters + sort ----
router.get('/users', async (req, res) => {
  const { name = '', email = '', address = '', role = '', sortBy = 'name', order = 'asc' } = req.query;
  const { col, direction } = sortClause(sortBy, order, ALLOWED_USER_SORT, 'name');

  try {
    const result = await pool.query(
      `SELECT id, name, email, address, role
       FROM users
       WHERE name ILIKE $1 AND email ILIKE $2 AND address ILIKE $3
         AND ($4 = '' OR role::text = $4)
       ORDER BY ${col} ${direction}`,
      [`%${name}%`, `%${email}%`, `%${address}%`, role]
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// ---- User detail (includes rating if Store Owner) ----
router.get('/users/:id', async (req, res) => {
  try {
    const userRes = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!userRes.rows.length) return res.status(404).json({ message: 'User not found' });
    const user = userRes.rows[0];

    if (user.role === 'STORE_OWNER') {
      const ratingRes = await pool.query(
        `SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS rating
         FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = $1`,
        [user.id]
      );
      user.rating = ratingRes.rows[0].rating;
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

module.exports = router;
