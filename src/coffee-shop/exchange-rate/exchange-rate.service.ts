import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Injectable()
export class ExchangeRateService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async findAll(fromCurrency?: string, toCurrency?: string) {
    let query = this.db
      .from('exchange_rates')
      .select('*')
      .order('effective_date', { ascending: false });
    if (fromCurrency) query = query.eq('from_currency', fromCurrency.toUpperCase());
    if (toCurrency) query = query.eq('to_currency', toCurrency.toUpperCase());
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('exchange_rates')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data)
      throw new NotFoundException(`Exchange rate ${id} not found`);
    return data;
  }

  /**
   * Get the latest active exchange rate for a currency pair.
   * Returns the most recent effective_date record.
   */
  async getLatestRate(fromCurrency: string, toCurrency: string) {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await this.db
      .from('exchange_rates')
      .select('*')
      .eq('from_currency', fromCurrency.toUpperCase())
      .eq('to_currency', toCurrency.toUpperCase())
      .eq('is_active', true)
      .lte('effective_date', today)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();
    if (error || !data)
      throw new NotFoundException(
        `No active exchange rate found for ${fromCurrency} → ${toCurrency}`,
      );
    return data;
  }

  /**
   * Convert an amount from one currency to another using the latest rate.
   */
  async convert(amount: number, fromCurrency: string, toCurrency: string) {
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase())
      return { from_currency: fromCurrency, to_currency: toCurrency, rate: 1, result: amount };
    const rateRecord = await this.getLatestRate(fromCurrency, toCurrency);
    const result = parseFloat((amount * rateRecord.rate).toFixed(2));
    return {
      from_currency: fromCurrency.toUpperCase(),
      to_currency: toCurrency.toUpperCase(),
      rate: rateRecord.rate,
      original_amount: amount,
      result,
      effective_date: rateRecord.effective_date,
    };
  }

  async create(dto: CreateExchangeRateDto) {
    const effectiveDate =
      dto.effective_date ?? new Date().toISOString().slice(0, 10);
    const { data, error } = await this.db
      .from('exchange_rates')
      .upsert({
        is_active: true,
        ...dto,
        from_currency: dto.from_currency.toUpperCase(),
        to_currency: dto.to_currency.toUpperCase(),
        effective_date: effectiveDate,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'from_currency,to_currency,effective_date' })
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateExchangeRateDto) {
    await this.findOne(id);
    const { data, error } = await this.db
      .from('exchange_rates')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    const { error } = await this.db.from('exchange_rates').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `Exchange rate ${id} deleted` };
  }
}
