-- ══════════════════════════════════════════════════════════════════════════
-- 004_branches.sql — Branch support
-- ══════════════════════════════════════════════════════════════════════════

-- ── Branches table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branches (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE,
  address     TEXT,
  phone       TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branches_name ON branches(name);

-- ── Add branch_id to users (cashier belongs to one branch) ───────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);

-- ── Add branch_id to staff_shifts ────────────────────────────────────────
ALTER TABLE staff_shifts
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_staff_shifts_branch_id ON staff_shifts(branch_id);

-- ── Add branch_id to sale_orders ─────────────────────────────────────────
ALTER TABLE sale_orders
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sale_orders_branch_id ON sale_orders(branch_id);

-- ── Add branch_id to sale_invoices ───────────────────────────────────────
ALTER TABLE sale_invoices
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sale_invoices_branch_id ON sale_invoices(branch_id);

-- ── Add branch_id to sale_receipts ───────────────────────────────────────
ALTER TABLE sale_receipts
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sale_receipts_branch_id ON sale_receipts(branch_id);
