export class CreateSaleReceiptDto {
  /** Confirmed invoice to generate receipt from */
  invoice_id: string;
  /**
   * Payment method code (e.g. 'cash' | 'card' | 'qr').
   * Must match a code in the payment_methods table.
   */
  payment_method: string;
  amount_paid: number;
  /** Link this receipt to a cashier's open shift */
  shift_id?: string;
  note?: string;
}
