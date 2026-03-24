import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { DiscountService } from '../discount/discount.service';
import { CreateSaleInvoiceDto } from './dto/create-sale-invoice.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { ApplyManualDiscountDto } from './dto/apply-manual-discount.dto';

@Injectable()
export class SaleInvoiceService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly discountService: DiscountService,
  ) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  // ─── Document Number ────────────────────────────────────────────────────────
  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const { data, error } = await this.db.rpc('get_next_document_number', {
      p_prefix: 'INV',
      p_date: date,
    });
    if (error) throw new InternalServerErrorException(error.message);
    return data as string;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  private async recalcInvoiceTotals(invoiceId: string) {
    // Sum of item subtotals (after item-level discounts)
    const { data: items, error: iErr } = await this.db
      .from('sale_invoice_items')
      .select('subtotal')
      .eq('invoice_id', invoiceId);
    if (iErr) throw new InternalServerErrorException(iErr.message);

    const itemsSubtotal = parseFloat(
      (items ?? []).reduce((s, i) => s + Number(i.subtotal), 0).toFixed(2),
    );

    // Sum of invoice-level discounts
    const { data: invDiscounts, error: dErr } = await this.db
      .from('sale_invoice_discounts')
      .select('applied_amount')
      .eq('invoice_id', invoiceId);
    if (dErr) throw new InternalServerErrorException(dErr.message);

    const invDiscountTotal = parseFloat(
      (invDiscounts ?? [])
        .reduce((s, d) => s + Number(d.applied_amount), 0)
        .toFixed(2),
    );

    // Also account for item-level discounts in total discount_amount
    const { data: itemDiscounts, error: idErr } = await this.db
      .from('sale_invoice_items')
      .select('discount_amount')
      .eq('invoice_id', invoiceId);
    if (idErr) throw new InternalServerErrorException(idErr.message);

    const itemDiscountTotal = parseFloat(
      (itemDiscounts ?? [])
        .reduce((s, i) => s + Number(i.discount_amount), 0)
        .toFixed(2),
    );

    const totalDiscountAmount = parseFloat(
      (invDiscountTotal + itemDiscountTotal).toFixed(2),
    );

    // subtotal = original before any discounts (item qty * unit_price)
    const { data: rawItems, error: rErr } = await this.db
      .from('sale_invoice_items')
      .select('quantity, unit_price')
      .eq('invoice_id', invoiceId);
    if (rErr) throw new InternalServerErrorException(rErr.message);

    const subtotal = parseFloat(
      (rawItems ?? [])
        .reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0)
        .toFixed(2),
    );

    const total = Math.max(
      0,
      parseFloat((subtotal - totalDiscountAmount).toFixed(2)),
    );

    await this.db
      .from('sale_invoices')
      .update({
        subtotal,
        discount_amount: totalDiscountAmount,
        total,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────
  async findAll(status?: string, customerId?: string) {
    let query = this.db
      .from('sale_invoices')
      .select(
        '*, sale_orders(*), customers(*), sale_invoice_items(*, products(*)), sale_invoice_discounts(*)',
      )
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (customerId) query = query.eq('customer_id', customerId);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('sale_invoices')
      .select(
        '*, sale_orders(*), customers(*), sale_invoice_items(*, products(*)), sale_invoice_discounts(*)',
      )
      .eq('id', id)
      .single();
    if (error || !data)
      throw new NotFoundException(`Sale invoice ${id} not found`);
    return data;
  }

  // ─── Create invoice from order ──────────────────────────────────────────────
  async create(dto: CreateSaleInvoiceDto) {
    // Fetch order with items
    const { data: order, error: oErr } = await this.db
      .from('sale_orders')
      .select('*, sale_order_items(*), customers(*)')
      .eq('id', dto.order_id)
      .single();
    if (oErr || !order)
      throw new NotFoundException(`Sale order ${dto.order_id} not found`);
    if (order.status === 'cancelled')
      throw new BadRequestException('Cannot invoice a cancelled order');

    // Check no existing non-cancelled invoice for this order
    const { data: existing } = await this.db
      .from('sale_invoices')
      .select('id, status')
      .eq('order_id', dto.order_id)
      .neq('status', 'cancelled');
    if (existing && existing.length > 0)
      throw new ConflictException(
        `An active invoice already exists for order ${dto.order_id}`,
      );

    const invoiceNumber = await this.generateInvoiceNumber();

    // Build invoice items from order items
    const invoiceItems: Array<{
      product_id: string | null;
      product_name: string;
      quantity: number;
      unit_price: number;
      discount_amount: number;
      subtotal: number;
      size_label: string | null;
      selected_toppings: any[];
    }> = (order.sale_order_items ?? []).map((item: any) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: 0,
      subtotal: parseFloat((item.unit_price * item.quantity).toFixed(2)),
      size_label: item.size_label ?? null,
      selected_toppings: item.selected_toppings ?? [],
    }));

    const subtotal = parseFloat(
      invoiceItems.reduce((s: number, i) => s + i.subtotal, 0).toFixed(2),
    );

    // Insert invoice
    const { data: invoice, error: invErr } = await this.db
      .from('sale_invoices')
      .insert({
        invoice_number: invoiceNumber,
        order_id: dto.order_id,
        customer_id: order.customer_id ?? null,
        branch_id: order.branch_id ?? null,
        status: 'draft',
        subtotal,
        discount_amount: 0,
        total: subtotal,
        note: dto.note ?? null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (invErr) throw new InternalServerErrorException(invErr.message);

    // Insert invoice items
    const itemsWithInvoiceId = invoiceItems.map((i) => ({
      ...i,
      invoice_id: invoice.id,
    }));
    const { error: iiErr } = await this.db
      .from('sale_invoice_items')
      .insert(itemsWithInvoiceId);
    if (iiErr) throw new InternalServerErrorException(iiErr.message);

    // Auto-apply product discounts per line item
    await this.autoApplyProductDiscounts(invoice.id, itemsWithInvoiceId);

    return this.findOne(invoice.id);
  }

  // ─── Auto-apply product-level discounts ─────────────────────────────────────
  private async autoApplyProductDiscounts(
    invoiceId: string,
    items: Array<{ invoice_id: string; product_id: string | null; subtotal: number }>,
  ) {
    for (const item of items) {
      if (!item.product_id) continue;
      const productDiscounts = await this.discountService.getProductDiscounts(
        item.product_id,
      );
      if (productDiscounts.length === 0) continue;

      // Apply the first active product discount (most specific wins)
      const discount = productDiscounts[0];
      const discountAmt = this.discountService.calcDiscountAmount(
        discount,
        item.subtotal,
      );
      const newSubtotal = Math.max(
        0,
        parseFloat((item.subtotal - discountAmt).toFixed(2)),
      );

      // Update the invoice item
      await this.db
        .from('sale_invoice_items')
        .update({ discount_amount: discountAmt, subtotal: newSubtotal })
        .eq('invoice_id', invoiceId)
        .eq('product_id', item.product_id);
    }

    await this.recalcInvoiceTotals(invoiceId);
  }

  // ─── Apply a discount manually ───────────────────────────────────────────────
  async applyDiscount(invoiceId: string, dto: ApplyDiscountDto) {
    const invoice = await this.findOne(invoiceId);
    if (invoice.status !== 'draft')
      throw new BadRequestException('Can only apply discounts to a draft invoice');

    const discount = await this.discountService.findOne(dto.discount_id);
    if (!discount.is_active)
      throw new BadRequestException('This discount is not active');

    // Prevent duplicate application
    const { data: existing } = await this.db
      .from('sale_invoice_discounts')
      .select('id')
      .eq('invoice_id', invoiceId)
      .eq('discount_id', dto.discount_id);
    if (existing && existing.length > 0)
      throw new ConflictException('This discount has already been applied to the invoice');

    // Validate based on type
    await this.validateDiscount(discount, invoice);

    // Calculate amount to deduct (against current invoice total)
    const appliedAmount = this.discountService.calcDiscountAmount(
      discount,
      invoice.total,
    );

    // Insert discount record
    const { error } = await this.db.from('sale_invoice_discounts').insert({
      invoice_id: invoiceId,
      discount_id: discount.id,
      discount_name: discount.name,
      discount_type: discount.type,
      discount_method: discount.discount_method,
      discount_value: discount.discount_value,
      applied_amount: appliedAmount,
    });
    if (error) throw new InternalServerErrorException(error.message);

    await this.recalcInvoiceTotals(invoiceId);
    return this.findOne(invoiceId);
  }

  // ─── Apply a manual (ad-hoc) discount ────────────────────────────────────────
  async applyManualDiscount(invoiceId: string, dto: ApplyManualDiscountDto) {
    const invoice = await this.findOne(invoiceId);
    if (invoice.status !== 'draft')
      throw new BadRequestException('Can only apply discounts to a draft invoice');
    if (dto.value <= 0)
      throw new BadRequestException('Discount value must be greater than 0');

    const appliedAmount =
      dto.discount_method === 'percentage'
        ? parseFloat(((invoice.total * dto.value) / 100).toFixed(4))
        : parseFloat(dto.value.toFixed(4));

    const cappedAmount = parseFloat(
      Math.min(appliedAmount, invoice.total).toFixed(4),
    );

    const label =
      dto.label ??
      (dto.discount_method === 'percentage'
        ? `${dto.value}% Discount`
        : `$${dto.value.toFixed(2)} Discount`);

    const { error } = await this.db.from('sale_invoice_discounts').insert({
      invoice_id: invoiceId,
      discount_id: null,
      discount_name: label,
      discount_type: 'manual',
      discount_method: dto.discount_method,
      discount_value: dto.value,
      applied_amount: cappedAmount,
    });
    if (error) throw new InternalServerErrorException(error.message);

    await this.recalcInvoiceTotals(invoiceId);
    return this.findOne(invoiceId);
  }

  private async validateDiscount(discount: any, invoice: any) {
    const now = new Date().toISOString();

    if (discount.type === 'event') {
      if (!discount.events)
        throw new BadRequestException('Discount is not linked to any event');
      if (!discount.events.is_active)
        throw new BadRequestException(`Event "${discount.events.name}" is not active`);
      if (discount.events.start_date > now || discount.events.end_date < now)
        throw new BadRequestException(`Event "${discount.events.name}" is not currently running`);
    }

    if (discount.type === 'customer') {
      if (!invoice.customer_id)
        throw new BadRequestException('Invoice has no customer; cannot apply customer discount');
      const customer = invoice.customers;
      const matchesId = discount.customer_id === invoice.customer_id;
      const matchesTier =
        discount.customer_tier && customer?.tier === discount.customer_tier;
      if (!matchesId && !matchesTier)
        throw new BadRequestException('Customer does not qualify for this discount');
    }

    if (discount.type === 'invoice') {
      if (
        discount.min_invoice_amount &&
        invoice.subtotal < discount.min_invoice_amount
      )
        throw new BadRequestException(
          `Invoice subtotal must be at least ${discount.min_invoice_amount} to use this discount`,
        );
    }

    if (discount.type === 'product') {
      // Product discounts are auto-applied; block manual application
      throw new BadRequestException(
        'Product discounts are applied automatically per line item',
      );
    }
  }

  // ─── Remove a discount from invoice ─────────────────────────────────────────
  async removeDiscount(invoiceId: string, discountId: string) {
    const invoice = await this.findOne(invoiceId);
    if (invoice.status !== 'draft')
      throw new BadRequestException('Can only remove discounts from a draft invoice');

    const { error } = await this.db
      .from('sale_invoice_discounts')
      .delete()
      .eq('invoice_id', invoiceId)
      .eq('discount_id', discountId);
    if (error) throw new InternalServerErrorException(error.message);

    // Also reset item-level discounts for product type — handled separately
    await this.recalcInvoiceTotals(invoiceId);
    return this.findOne(invoiceId);
  }

  // ─── Auto-apply all eligible discounts ──────────────────────────────────────
  async autoApplyAllDiscounts(invoiceId: string) {
    const invoice = await this.findOne(invoiceId);
    if (invoice.status !== 'draft')
      throw new BadRequestException('Can only auto-apply discounts to a draft invoice');

    const appliedIds: string[] = (invoice.sale_invoice_discounts ?? []).map(
      (d: any) => d.discount_id,
    );

    // 1. Event discounts
    const eventDiscounts = await this.discountService.getActiveEventDiscounts();
    for (const d of eventDiscounts) {
      if (appliedIds.includes(d.id)) continue;

      if (d.product_id) {
        // Product-specific event discount — apply per matching invoice item
        const { data: matchingItems } = await this.db
          .from('sale_invoice_items')
          .select('*')
          .eq('invoice_id', invoiceId)
          .eq('product_id', d.product_id);

        for (const item of matchingItems ?? []) {
          const itemSubtotal = parseFloat((Number(item.unit_price) * Number(item.quantity)).toFixed(2));
          const discAmt = this.discountService.calcDiscountAmount(d, itemSubtotal);
          const newSubtotal = Math.max(0, parseFloat((itemSubtotal - discAmt).toFixed(2)));
          await this.db
            .from('sale_invoice_items')
            .update({ discount_amount: discAmt, subtotal: newSubtotal })
            .eq('id', item.id);
        }
      } else {
        // Whole-invoice event discount
        const amt = this.discountService.calcDiscountAmount(d, invoice.total);
        await this.db.from('sale_invoice_discounts').insert({
          invoice_id: invoiceId,
          discount_id: d.id,
          discount_name: d.name,
          discount_type: d.type,
          discount_method: d.discount_method,
          discount_value: d.discount_value,
          applied_amount: amt,
        });
      }
      appliedIds.push(d.id);
    }

    // 2. Customer discounts
    if (invoice.customer_id && invoice.customers) {
      const customerDiscounts = await this.discountService.getCustomerDiscounts(
        invoice.customer_id,
        invoice.customers.tier,
      );
      for (const d of customerDiscounts) {
        if (appliedIds.includes(d.id)) continue;
        const amt = this.discountService.calcDiscountAmount(d, invoice.total);
        await this.db.from('sale_invoice_discounts').insert({
          invoice_id: invoiceId,
          discount_id: d.id,
          discount_name: d.name,
          discount_type: d.type,
          discount_method: d.discount_method,
          discount_value: d.discount_value,
          applied_amount: amt,
        });
        appliedIds.push(d.id);
      }
    }

    // 3. Invoice discounts (based on subtotal)
    const invoiceDiscounts = await this.discountService.getInvoiceDiscounts(
      invoice.subtotal,
    );
    for (const d of invoiceDiscounts) {
      if (appliedIds.includes(d.id)) continue;
      const amt = this.discountService.calcDiscountAmount(d, invoice.total);
      await this.db.from('sale_invoice_discounts').insert({
        invoice_id: invoiceId,
        discount_id: d.id,
        discount_name: d.name,
        discount_type: d.type,
        discount_method: d.discount_method,
        discount_value: d.discount_value,
        applied_amount: amt,
      });
    }

    await this.recalcInvoiceTotals(invoiceId);
    return this.findOne(invoiceId);
  }

  // ─── Confirm invoice ─────────────────────────────────────────────────────────
  async confirm(id: string) {
    const invoice = await this.findOne(id);
    if (invoice.status !== 'draft')
      throw new BadRequestException(`Invoice is already ${invoice.status}`);
    const { data, error } = await this.db
      .from('sale_invoices')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // ─── Cancel invoice ──────────────────────────────────────────────────────────
  async cancel(id: string) {
    const invoice = await this.findOne(id);
    if (invoice.status === 'cancelled')
      throw new BadRequestException('Invoice is already cancelled');
    if (invoice.status === 'paid')
      throw new BadRequestException('Cannot cancel a paid invoice');
    const { data, error } = await this.db
      .from('sale_invoices')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
