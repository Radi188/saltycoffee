import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async findAll(type?: string) {
    let query = this.db
      .from('discounts')
      .select('*, events(*), customers(*), products(*)')
      .order('created_at', { ascending: false });
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('discounts')
      .select('*, events(*), customers(*), products(*)')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException(`Discount ${id} not found`);
    return data;
  }

  async create(dto: CreateDiscountDto) {
    const { data, error } = await this.db
      .from('discounts')
      .insert({ is_active: true, ...dto, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateDiscountDto) {
    await this.findOne(id);
    const { data, error } = await this.db
      .from('discounts')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    const { error } = await this.db.from('discounts').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `Discount ${id} deleted` };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers used by SaleInvoiceService
  // ─────────────────────────────────────────────────────────────────────────

  /** Return all active product discounts for a given product id */
  async getProductDiscounts(productId: string) {
    const { data, error } = await this.db
      .from('discounts')
      .select('*')
      .eq('type', 'product')
      .eq('product_id', productId)
      .eq('is_active', true);
    if (error) throw new InternalServerErrorException(error.message);
    return data ?? [];
  }

  /** Return all active event discounts whose event is currently running */
  async getActiveEventDiscounts() {
    const now = new Date().toISOString();
    const { data, error } = await this.db
      .from('discounts')
      .select('*, events(*)')
      .eq('type', 'event')
      .eq('is_active', true);
    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).filter(
      (d) =>
        d.events &&
        d.events.is_active &&
        d.events.start_date <= now &&
        d.events.end_date >= now,
    );
  }

  /** Return active customer discounts for a specific customer id or tier */
  async getCustomerDiscounts(customerId: string, tier: string) {
    const { data, error } = await this.db
      .from('discounts')
      .select('*')
      .eq('type', 'customer')
      .eq('is_active', true);
    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).filter(
      (d) =>
        d.customer_id === customerId ||
        (d.customer_tier && d.customer_tier === tier),
    );
  }

  /** Return active invoice discounts that qualify based on subtotal */
  async getInvoiceDiscounts(subtotal: number) {
    const { data, error } = await this.db
      .from('discounts')
      .select('*')
      .eq('type', 'invoice')
      .eq('is_active', true);
    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).filter(
      (d) => !d.min_invoice_amount || subtotal >= d.min_invoice_amount,
    );
  }

  /** Calculate the money value of a single discount record against a base amount */
  calcDiscountAmount(
    discount: { discount_method: string; discount_value: number },
    baseAmount: number,
  ): number {
    if (discount.discount_method === 'percentage') {
      return parseFloat(
        ((baseAmount * discount.discount_value) / 100).toFixed(2),
      );
    }
    return Math.min(discount.discount_value, baseAmount);
  }
}
