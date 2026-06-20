// Run once after creating the schema: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function seed() {
  const name = 'System Platform Administrator'; // >=20 chars required by schema
  const email = 'admin@storerating.com';
  const plainPassword = 'Admin@1234';
  const address = 'HQ Office';

  const hashed = await bcrypt.hash(plainPassword, 10);

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('Admin already exists. Skipping.');
      return process.exit(0);
    }

    await pool.query(
      `INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, 'ADMIN')`,
      [name, email, hashed, address]
    );

    console.log('Admin created:');
    console.log('  email:', email);
    console.log('  password:', plainPassword);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
