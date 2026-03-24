-- Migration 006 — Add image_url to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
