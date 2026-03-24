import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateSaleReceiptDto } from './dto/create-sale-receipt.dto';

@Injectable()
export class SaleReceiptService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  // ─── Document Number ────────────────────────────────────────────────────────
  private async generateReceiptNumber(): Promise<string> {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const { data, error } = await this.db.rpc('get_next_document_number', {
      p_prefix: 'RCP',
      p_date: date,
    });
    if (error) throw new InternalServerErrorException(error.message);
    return data as string;
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────
  async findAll(customerId?: string, paymentMethod?: string) {
    let query = this.db
      .from('sale_receipts')
      .select(
        '*, sale_invoices(*, sale_invoice_items(*, products(*))), customers(*)',
      )
      .order('created_at', { ascending: false });
    if (customerId) query = query.eq('customer_id', customerId);
    if (paymentMethod) query = query.eq('payment_method', paymentMethod);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('sale_receipts')
      .select(
        '*, sale_invoices(*, sale_invoice_items(*, products(*)), sale_invoice_discounts(*)), customers(*)',
      )
      .eq('id', id)
      .single();
    if (error || !data)
      throw new NotFoundException(`Sale receipt ${id} not found`);
    return data;
  }

  // ─── Create receipt from confirmed invoice ──────────────────────────────────
  async create(dto: CreateSaleReceiptDto) {
    // Fetch invoice
    const { data: invoice, error: invErr } = await this.db
      .from('sale_invoices')
      .select('*')
      .eq('id', dto.invoice_id)
      .single();
    if (invErr || !invoice)
      throw new NotFoundException(`Sale invoice ${dto.invoice_id} not found`);
    if (invoice.status !== 'confirmed')
      throw new BadRequestException(
        'Invoice must be confirmed before generating a receipt',
      );

    // Check no existing receipt for this invoice
    const { data: existing } = await this.db
      .from('sale_receipts')
      .select('id')
      .eq('invoice_id', dto.invoice_id);
    if (existing && existing.length > 0)
      throw new BadRequestException(
        `A receipt already exists for invoice ${dto.invoice_id}`,
      );

    if (dto.amount_paid < invoice.total)
      throw new BadRequestException(
        `Amount paid (${dto.amount_paid}) is less than invoice total (${invoice.total})`,
      );

    const changeAmount = parseFloat(
      (dto.amount_paid - invoice.total).toFixed(2),
    );
    const receiptNumber = await this.generateReceiptNumber();

    // Resolve payment_method_id from payment_methods table (optional, best-effort)
    const { data: pmRow } = await this.db
      .from('payment_methods')
      .select('id')
      .eq('code', dto.payment_method)
      .single();

    // Validate shift_id if provided
    if (dto.shift_id) {
      const { data: shiftRow, error: shiftErr } = await this.db
        .from('staff_shifts')
        .select('id, status')
        .eq('id', dto.shift_id)
        .single();
      if (shiftErr || !shiftRow)
        throw new NotFoundException(`Staff shift ${dto.shift_id} not found`);
      if (shiftRow.status !== 'open')
        throw new BadRequestException('Cannot link receipt to a closed shift');
    }

    const { data: receipt, error: rErr } = await this.db
      .from('sale_receipts')
      .insert({
        receipt_number: receiptNumber,
        invoice_id: dto.invoice_id,
        order_id: invoice.order_id ?? null,
        customer_id: invoice.customer_id ?? null,
        branch_id: invoice.branch_id ?? null,
        payment_method: dto.payment_method,
        payment_method_id: pmRow?.id ?? null,
        shift_id: dto.shift_id ?? null,
        subtotal: invoice.subtotal,
        discount_amount: invoice.discount_amount,
        total: invoice.total,
        amount_paid: dto.amount_paid,
        change_amount: changeAmount,
        note: dto.note ?? null,
      })
      .select()
      .single();
    if (rErr) throw new InternalServerErrorException(rErr.message);

    // Mark invoice as paid
    await this.db
      .from('sale_invoices')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', dto.invoice_id);

    return this.findOne(receipt.id);
  }
}
