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
exports.SaleReceiptService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let SaleReceiptService = class SaleReceiptService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get db() {
        return this.supabaseService.getClient();
    }
    async generateReceiptNumber() {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const { data, error } = await this.db.rpc('get_next_document_number', {
            p_prefix: 'RCP',
            p_date: date,
        });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findAll(customerId, paymentMethod) {
        let query = this.db
            .from('sale_receipts')
            .select('*, sale_invoices(*, sale_invoice_items(*, products(*))), customers(*)')
            .order('created_at', { ascending: false });
        if (customerId)
            query = query.eq('customer_id', customerId);
        if (paymentMethod)
            query = query.eq('payment_method', paymentMethod);
        const { data, error } = await query;
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.db
            .from('sale_receipts')
            .select('*, sale_invoices(*, sale_invoice_items(*, products(*)), sale_invoice_discounts(*)), customers(*)')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`Sale receipt ${id} not found`);
        return data;
    }
    async create(dto) {
        const { data: invoice, error: invErr } = await this.db
            .from('sale_invoices')
            .select('*')
            .eq('id', dto.invoice_id)
            .single();
        if (invErr || !invoice)
            throw new common_1.NotFoundException(`Sale invoice ${dto.invoice_id} not found`);
        if (invoice.status !== 'confirmed')
            throw new common_1.BadRequestException('Invoice must be confirmed before generating a receipt');
        const { data: existing } = await this.db
            .from('sale_receipts')
            .select('id')
            .eq('invoice_id', dto.invoice_id);
        if (existing && existing.length > 0)
            throw new common_1.BadRequestException(`A receipt already exists for invoice ${dto.invoice_id}`);
        if (dto.amount_paid < invoice.total)
            throw new common_1.BadRequestException(`Amount paid (${dto.amount_paid}) is less than invoice total (${invoice.total})`);
        const changeAmount = parseFloat((dto.amount_paid - invoice.total).toFixed(2));
        const receiptNumber = await this.generateReceiptNumber();
        const { data: pmRow } = await this.db
            .from('payment_methods')
            .select('id')
            .eq('code', dto.payment_method)
            .single();
        if (dto.shift_id) {
            const { data: shiftRow, error: shiftErr } = await this.db
                .from('staff_shifts')
                .select('id, status')
                .eq('id', dto.shift_id)
                .single();
            if (shiftErr || !shiftRow)
                throw new common_1.NotFoundException(`Staff shift ${dto.shift_id} not found`);
            if (shiftRow.status !== 'open')
                throw new common_1.BadRequestException('Cannot link receipt to a closed shift');
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
        if (rErr)
            throw new common_1.InternalServerErrorException(rErr.message);
        await this.db
            .from('sale_invoices')
            .update({ status: 'paid', updated_at: new Date().toISOString() })
            .eq('id', dto.invoice_id);
        return this.findOne(receipt.id);
    }
};
exports.SaleReceiptService = SaleReceiptService;
exports.SaleReceiptService = SaleReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SaleReceiptService);
//# sourceMappingURL=sale-receipt.service.js.map