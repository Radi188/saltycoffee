"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleInvoiceService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
const discount_service_1 = require("../discount/discount.service");
let SaleInvoiceService = class SaleInvoiceService {
    supabaseService;
    discountService;
    constructor(supabaseService, discountService) {
        this.supabaseService = supabaseService;
        this.discountService = discountService;
    }
    get db() {
        return this.supabaseService.getClient();
    }
    async generateInvoiceNumber() {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const { data, error } = await this.db.rpc('get_next_document_number', {
            p_prefix: 'INV',
            p_date: date,
        });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async recalcInvoiceTotals(invoiceId) {
        const { data: items, error: iErr } = await this.db
            .from('sale_invoice_items')
            .select('subtotal')
            .eq('invoice_id', invoiceId);
        if (iErr)
            throw new common_1.InternalServerErrorException(iErr.message);
        const itemsSubtotal = parseFloat((items ?? []).reduce((s, i) => s + Number(i.subtotal), 0).toFixed(2));
        const { data: invDiscounts, error: dErr } = await this.db
            .from('sale_invoice_discounts')
            .select('applied_amount')
            .eq('invoice_id', invoiceId);
        if (dErr)
            throw new common_1.InternalServerErrorException(dErr.message);
        const invDiscountTotal = parseFloat((invDiscounts ?? [])
            .reduce((s, d) => s + Number(d.applied_amount), 0)
            .toFixed(2));
        const { data: itemDiscounts, error: idErr } = await this.db
            .from('sale_invoice_items')
            .select('discount_amount')
            .eq('invoice_id', invoiceId);
        if (idErr)
            throw new common_1.InternalServerErrorException(idErr.message);
        const itemDiscountTotal = parseFloat((itemDiscounts ?? [])
            .reduce((s, i) => s + Number(i.discount_amount), 0)
            .toFixed(2));
        const totalDiscountAmount = parseFloat((invDiscountTotal + itemDiscountTotal).toFixed(2));
        const { data: rawItems, error: rErr } = await this.db
            .from('sale_invoice_items')
            .select('quantity, unit_price')
            .eq('invoice_id', invoiceId);
        if (rErr)
            throw new common_1.InternalServerErrorException(rErr.message);
        const subtotal = parseFloat((rawItems ?? [])
            .reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0)
            .toFixed(2));
        const total = Math.max(0, parseFloat((subtotal - totalDiscountAmount).toFixed(2)));
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
    async findAll(status, customerId) {
        let query = this.db
            .from('sale_invoices')
            .select('*, sale_orders(*), customers(*), sale_invoice_items(*, products(*)), sale_invoice_discounts(*)')
            .order('created_at', { ascending: false });
        if (status)
            query = query.eq('status', status);
        if (customerId)
            query = query.eq('customer_id', customerId);
        const { data, error } = await query;
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.db
            .from('sale_invoices')
            .select('*, sale_orders(*), customers(*), sale_invoice_items(*, products(*)), sale_invoice_discounts(*)')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`Sale invoice ${id} not found`);
        return data;
    }
    async create(dto) {
        const { data: order, error: oErr } = await this.db
            .from('sale_orders')
            .select('*, sale_order_items(*), customers(*)')
            .eq('id', dto.order_id)
            .single();
        if (oErr || !order)
            throw new common_1.NotFoundException(`Sale order ${dto.order_id} not found`);
        if (order.status === 'cancelled')
            throw new common_1.BadRequestException('Cannot invoice a cancelled order');
        const { data: existing } = await this.db
            .from('sale_invoices')
            .select('id, status')
            .eq('order_id', dto.order_id)
            .neq('status', 'cancelled');
        if (existing && existing.length > 0)
            throw new common_1.ConflictException(`An active invoice already exists for order ${dto.order_id}`);
        const invoiceNumber = await this.generateInvoiceNumber();
        const invoiceItems = (order.sale_order_items ?? []).map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_amount: 0,
            subtotal: parseFloat((item.unit_price * item.quantity).toFixed(2)),
            size_label: item.size_label ?? null,
            selected_toppings: item.selected_toppings ?? [],
        }));
        const subtotal = parseFloat(invoiceItems.reduce((s, i) => s + i.subtotal, 0).toFixed(2));
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
        if (invErr)
            throw new common_1.InternalServerErrorException(invErr.message);
        const itemsWithInvoiceId = invoiceItems.map((i) => ({
            ...i,
            invoice_id: invoice.id,
        }));
        const { error: iiErr } = await this.db
            .from('sale_invoice_items')
            .insert(itemsWithInvoiceId);
        if (iiErr)
            throw new common_1.InternalServerErrorException(iiErr.message);
        await this.autoApplyProductDiscounts(invoice.id, itemsWithInvoiceId);
        return this.findOne(invoice.id);
    }
    async autoApplyProductDiscounts(invoiceId, items) {
        for (const item of items) {
            if (!item.product_id)
                continue;
            const productDiscounts = await this.discountService.getProductDiscounts(item.product_id);
            if (productDiscounts.length === 0)
                continue;
            const discount = productDiscounts[0];
            const discountAmt = this.discountService.calcDiscountAmount(discount, item.subtotal);
            const newSubtotal = Math.max(0, parseFloat((item.subtotal - discountAmt).toFixed(2)));
            await this.db
                .from('sale_invoice_items')
                .update({ discount_amount: discountAmt, subtotal: newSubtotal })
                .eq('invoice_id', invoiceId)
                .eq('product_id', item.product_id);
        }
        await this.recalcInvoiceTotals(invoiceId);
    }
    async applyDiscount(invoiceId, dto) {
        const invoice = await this.findOne(invoiceId);
        if (invoice.status !== 'draft')
            throw new common_1.BadRequestException('Can only apply discounts to a draft invoice');
        const discount = await this.discountService.findOne(dto.discount_id);
        if (!discount.is_active)
            throw new common_1.BadRequestException('This discount is not active');
        const { data: existing } = await this.db
            .from('sale_invoice_discounts')
            .select('id')
            .eq('invoice_id', invoiceId)
            .eq('discount_id', dto.discount_id);
        if (existing && existing.length > 0)
            throw new common_1.ConflictException('This discount has already been applied to the invoice');
        await this.validateDiscount(discount, invoice);
        const appliedAmount = this.discountService.calcDiscountAmount(discount, invoice.total);
        const { error } = await this.db.from('sale_invoice_discounts').insert({
            invoice_id: invoiceId,
            discount_id: discount.id,
            discount_name: discount.name,
            discount_type: discount.type,
            discount_method: discount.discount_method,
            discount_value: discount.discount_value,
            applied_amount: appliedAmount,
        });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        await this.recalcInvoiceTotals(invoiceId);
        return this.findOne(invoiceId);
    }
    async applyManualDiscount(invoiceId, dto) {
        const invoice = await this.findOne(invoiceId);
        if (invoice.status !== 'draft')
            throw new common_1.BadRequestException('Can only apply discounts to a draft invoice');
        if (dto.value <= 0)
            throw new common_1.BadRequestException('Discount value must be greater than 0');
        const appliedAmount = dto.discount_method === 'percentage'
            ? parseFloat(((invoice.total * dto.value) / 100).toFixed(4))
            : parseFloat(dto.value.toFixed(4));
        const cappedAmount = parseFloat(Math.min(appliedAmount, invoice.total).toFixed(4));
        const label = dto.label ??
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
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        await this.recalcInvoiceTotals(invoiceId);
        return this.findOne(invoiceId);
    }
    async validateDiscount(discount, invoice) {
        const now = new Date().toISOString();
        if (discount.type === 'event') {
            if (!discount.events)
                throw new common_1.BadRequestException('Discount is not linked to any event');
            if (!discount.events.is_active)
                throw new common_1.BadRequestException(`Event "${discount.events.name}" is not active`);
            if (discount.events.start_date > now || discount.events.end_date < now)
                throw new common_1.BadRequestException(`Event "${discount.events.name}" is not currently running`);
        }
        if (discount.type === 'customer') {
            if (!invoice.customer_id)
                throw new common_1.BadRequestException('Invoice has no customer; cannot apply customer discount');
            const customer = invoice.customers;
            const matchesId = discount.customer_id === invoice.customer_id;
            const matchesTier = discount.customer_tier && customer?.tier === discount.customer_tier;
            if (!matchesId && !matchesTier)
                throw new common_1.BadRequestException('Customer does not qualify for this discount');
        }
        if (discount.type === 'invoice') {
            if (discount.min_invoice_amount &&
                invoice.subtotal < discount.min_invoice_amount)
                throw new common_1.BadRequestException(`Invoice subtotal must be at least ${discount.min_invoice_amount} to use this discount`);
        }
        if (discount.type === 'product') {
            throw new common_1.BadRequestException('Product discounts are applied automatically per line item');
        }
    }
    async removeDiscount(invoiceId, discountId) {
        const invoice = await this.findOne(invoiceId);
        if (invoice.status !== 'draft')
            throw new common_1.BadRequestException('Can only remove discounts from a draft invoice');
        const { error } = await this.db
            .from('sale_invoice_discounts')
            .delete()
            .eq('invoice_id', invoiceId)
            .eq('discount_id', discountId);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        await this.recalcInvoiceTotals(invoiceId);
        return this.findOne(invoiceId);
    }
    async autoApplyAllDiscounts(invoiceId) {
        const invoice = await this.findOne(invoiceId);
        if (invoice.status !== 'draft')
            throw new common_1.BadRequestException('Can only auto-apply discounts to a draft invoice');
        const appliedIds = (invoice.sale_invoice_discounts ?? []).map((d) => d.discount_id);
        const eventDiscounts = await this.discountService.getActiveEventDiscounts();
        for (const d of eventDiscounts) {
            if (appliedIds.includes(d.id))
                continue;
            if (d.product_id) {
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
            }
            else {
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
        if (invoice.customer_id && invoice.customers) {
            const customerDiscounts = await this.discountService.getCustomerDiscounts(invoice.customer_id, invoice.customers.tier);
            for (const d of customerDiscounts) {
                if (appliedIds.includes(d.id))
                    continue;
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
        const invoiceDiscounts = await this.discountService.getInvoiceDiscounts(invoice.subtotal);
        for (const d of invoiceDiscounts) {
            if (appliedIds.includes(d.id))
                continue;
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
    async confirm(id) {
        const invoice = await this.findOne(id);
        if (invoice.status !== 'draft')
            throw new common_1.BadRequestException(`Invoice is already ${invoice.status}`);
        const { data, error } = await this.db
            .from('sale_invoices')
            .update({ status: 'confirmed', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async cancel(id) {
        const invoice = await this.findOne(id);
        if (invoice.status === 'cancelled')
            throw new common_1.BadRequestException('Invoice is already cancelled');
        if (invoice.status === 'paid')
            throw new common_1.BadRequestException('Cannot cancel a paid invoice');
        const { data, error } = await this.db
            .from('sale_invoices')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
};
exports.SaleInvoiceService = SaleInvoiceService;
exports.SaleInvoiceService = SaleInvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        discount_service_1.DiscountService])
], SaleInvoiceService);
//# sourceMappingURL=sale-invoice.service.js.map