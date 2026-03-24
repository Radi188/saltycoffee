-- ============================================================
-- Coffee Shop Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Products (menu items)
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL DEFAULT 'coffee', -- coffee, food, beverage, other
  base_price    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE,
  phone         TEXT,
  tier          TEXT NOT NULL DEFAULT 'regular', -- regular, silver, gold, vip
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events (discount events like Happy Hour, Christmas Sale)
CREATE TABLE IF NOT EXISTS events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  start_date    TIMESTAMPTZ NOT NULL,
  end_date      TIMESTAMPTZ NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Discounts (4 types: event / customer / product / invoice)
CREATE TABLE IF NOT EXISTS discounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  type                TEXT NOT NULL, -- 'event', 'customer', 'product', 'invoice'
  discount_method     TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
  discount_value      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  -- event type
  event_id            UUID REFERENCES events(id) ON DELETE SET NULL,
  -- customer type
  customer_id         UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_tier       TEXT, -- applies to all customers of this tier if set
  -- product type
  product_id          UUID REFERENCES products(id) ON DELETE SET NULL,
  -- invoice type
  min_invoice_amount  NUMERIC(10, 2), -- minimum subtotal to qualify
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sale Orders
CREATE TABLE IF NOT EXISTS sale_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number  TEXT UNIQUE NOT NULL,
  customer_id   UUID REFERENCES customers(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'draft', -- draft, confirmed, cancelled
  subtotal      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sale Order Items
CREATE TABLE IF NOT EXISTS sale_order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES sale_orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  quantity      NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal      NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Sale Invoices
CREATE TABLE IF NOT EXISTS sale_invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT UNIQUE NOT NULL,
  order_id        UUID REFERENCES sale_orders(id) ON DELETE SET NULL,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'draft', -- draft, confirmed, cancelled
  subtotal        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sale Invoice Items (snapshot from order items)
CREATE TABLE IF NOT EXISTS sale_invoice_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES sale_invoices(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name    TEXT NOT NULL,
  quantity        NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal        NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Discounts applied to a sale invoice
CREATE TABLE IF NOT EXISTS sale_invoice_discounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES sale_invoices(id) ON DELETE CASCADE,
  discount_id     UUID REFERENCES discounts(id) ON DELETE SET NULL,
  discount_name   TEXT NOT NULL,
  discount_type   TEXT NOT NULL,
  discount_method TEXT NOT NULL,
  discount_value  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  applied_amount  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sale Receipts
CREATE TABLE IF NOT EXISTS sale_receipts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number  TEXT UNIQUE NOT NULL,
  invoice_id      UUID NOT NULL REFERENCES sale_invoices(id) ON DELETE RESTRICT,
  order_id        UUID REFERENCES sale_orders(id) ON DELETE SET NULL,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  payment_method  TEXT NOT NULL DEFAULT 'cash', -- cash, card, qr
  subtotal        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  amount_paid     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  change_amount   NUMERIC(10, 2) NOT NULL DEFAULT 0,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document number sequence table
CREATE TABLE IF NOT EXISTS document_sequences (
  prefix      TEXT PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO document_sequences (prefix, last_number) VALUES
  ('SO', 0),
  ('INV', 0),
  ('RCP', 0)
ON CONFLICT (prefix) DO NOTHING;

-- ============================================================
-- Helper function: atomically generate next document number
-- Usage: SELECT get_next_document_number('SO', '20260322')
-- Returns: 'SO-20260322-0001'
-- ============================================================
CREATE OR REPLACE FUNCTION get_next_document_number(p_prefix TEXT, p_date TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_next INTEGER;
BEGIN
  UPDATE document_sequences
  SET last_number = last_number + 1,
      updated_at  = NOW()
  WHERE prefix = p_prefix
  RETURNING last_number INTO v_next;

  RETURN p_prefix || '-' || p_date || '-' || LPAD(v_next::TEXT, 4, '0');
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sale_orders_customer      ON sale_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_orders_status        ON sale_orders(status);
CREATE INDEX IF NOT EXISTS idx_sale_invoices_order       ON sale_invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_sale_invoices_customer    ON sale_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_invoices_status      ON sale_invoices(status);
CREATE INDEX IF NOT EXISTS idx_sale_receipts_invoice     ON sale_receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_discounts_type            ON discounts(type);
CREATE INDEX IF NOT EXISTS idx_discounts_event           ON discounts(event_id);
CREATE INDEX IF NOT EXISTS idx_discounts_customer        ON discounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_discounts_product         ON discounts(product_id);
