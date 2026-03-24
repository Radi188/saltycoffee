export class CreateDiscountDto {
  name: string;
  /** 'event' | 'customer' | 'product' | 'invoice' */
  type: string;
  /** 'percentage' | 'fixed' */
  discount_method: string;
  discount_value: number;

  // ── event discount ──────────────────────────────────────────
  event_id?: string;

  // ── customer discount ────────────────────────────────────────
  /** specific customer */
  customer_id?: string;
  /** all customers of this tier (regular | silver | gold | vip) */
  customer_tier?: string;

  // ── product discount ─────────────────────────────────────────
  product_id?: string;

  // ── invoice discount ─────────────────────────────────────────
  /** minimum invoice subtotal required to unlock this discount */
  min_invoice_amount?: number;

  is_active?: boolean;
}
