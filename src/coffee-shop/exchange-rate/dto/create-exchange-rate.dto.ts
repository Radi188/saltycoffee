export class CreateExchangeRateDto {
  from_currency: string; // e.g. USD
  to_currency: string;   // e.g. KHR
  rate: number;
  effective_date?: string; // ISO date YYYY-MM-DD; defaults to today
  is_active?: boolean;
  note?: string;
}
