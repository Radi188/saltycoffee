-- Migration 005 — Add icon & color to categories; icon to products
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS icon  TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS icon TEXT;
