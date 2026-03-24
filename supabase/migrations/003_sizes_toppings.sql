-- ============================================================
-- Migration 003 — Product sizes & toppings
-- ============================================================

-- Product size variants (S / M / L each with an absolute price)
CREATE TABLE product_sizes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_label  VARCHAR(10) NOT NULL,          -- 'S', 'M', 'L'
  price       NUMERIC(10,2) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Toppings / add-ons (global, apply to any product)
CREATE TABLE toppings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Capture the selected size + toppings on each order line
ALTER TABLE sale_order_items
  ADD COLUMN size_label        VARCHAR(10),
  ADD COLUMN selected_toppings JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Mirror on invoice items (copied from order items)
ALTER TABLE sale_invoice_items
  ADD COLUMN size_label        VARCHAR(10),
  ADD COLUMN selected_toppings JSONB NOT NULL DEFAULT '[]'::jsonb;
