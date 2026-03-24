export class ApplyManualDiscountDto {
  /** 'percentage' = % off total | 'fixed' = fixed USD amount off */
  discount_method: 'percentage' | 'fixed';
  /** value: e.g. 10 for 10%, or 1.5 for $1.50 */
  value: number;
  /** Optional label shown on receipt */
  label?: string;
}
