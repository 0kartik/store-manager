-- ============================================
-- Store Rating Platform - Database Schema
-- ============================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'USER', 'STORE_OWNER');

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL CHECK (char_length(name) >= 20),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  address       VARCHAR(400),
  role          user_role NOT NULL DEFAULT 'USER',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE stores (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  address       VARCHAR(400),
  owner_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ratings (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id      INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, store_id)  -- one rating per user per store; updates overwrite this row
);

-- Indexes for filtering / sorting performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_ratings_store ON ratings(store_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);

-- Seed admin user is created separately via seed.js (password gets bcrypt-hashed there)
