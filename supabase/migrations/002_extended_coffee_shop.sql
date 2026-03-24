-- ============================================================
-- Extended Coffee Shop Schema
-- Run AFTER 001_coffee_shop.sql
-- ============================================================

-- ── Categories ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add category_id to products (keep legacy category TEXT for snapshots)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- ── Payment Methods ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_methods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  code        TEXT UNIQUE NOT NULL,   -- cash | card | qr | bank_transfer | other
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO payment_methods (name, code) VALUES
  ('Cash',         'cash'),
  ('Credit/Debit Card', 'card'),
  ('QR Code',      'qr'),
  ('Bank Transfer','bank_transfer')
ON CONFLICT (code) DO NOTHING;

-- Link receipts to payment_method table (snapshot text kept)
ALTER TABLE sale_receipts
  ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL;

-- ── Users (App users / staff) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'cashier',  -- admin | manager | cashier
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Exchange Rates ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exchange_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency   TEXT NOT NULL,           -- e.g. USD
  to_currency     TEXT NOT NULL,           -- e.g. KHR
  rate            NUMERIC(20, 6) NOT NULL, -- 1 USD = X KHR
  effective_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_currency, to_currency, effective_date)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency, effective_date DESC);

-- ── Staff Shifts ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_shifts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_number    TEXT UNIQUE NOT NULL,
  user_id         UUID NOT NULL REFERENCES users(id),
  status          TEXT NOT NULL DEFAULT 'open',   -- open | closed
  opening_cash    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  closing_cash    NUMERIC(10, 2),
  expected_cash   NUMERIC(10, 2),   -- opening_cash + cash sales
  cash_difference NUMERIC(10, 2),   -- closing_cash - expected_cash
  opened_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at       TIMESTAMPTZ,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_shifts_user   ON staff_shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_status ON staff_shifts(status);

-- Link receipts to a shift
ALTER TABLE sale_receipts
  ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES staff_shifts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sale_receipts_shift ON sale_receipts(shift_id);

-- Sequence for shift numbers
INSERT INTO document_sequences (prefix, last_number) VALUES ('SHF', 0)
ON CONFLICT (prefix) DO NOTHING;
