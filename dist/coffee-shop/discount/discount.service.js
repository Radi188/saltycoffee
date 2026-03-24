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
exports.DiscountService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let DiscountService = class DiscountService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get db() {
        return this.supabaseService.getClient();
    }
    async findAll(type) {
        let query = this.db
            .from('discounts')
            .select('*, events(*), customers(*), products(*)')
            .order('created_at', { ascending: false });
        if (type)
            query = query.eq('type', type);
        const { data, error } = await query;
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.db
            .from('discounts')
            .select('*, events(*), customers(*), products(*)')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`Discount ${id} not found`);
        return data;
    }
    async create(dto) {
        const { data, error } = await this.db
            .from('discounts')
            .insert({ is_active: true, ...dto, updated_at: new Date().toISOString() })
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async update(id, dto) {
        await this.findOne(id);
        const { data, error } = await this.db
            .from('discounts')
            .update({ ...dto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async remove(id) {
        await this.findOne(id);
        const { error } = await this.db.from('discounts').delete().eq('id', id);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: `Discount ${id} deleted` };
    }
    async getProductDiscounts(productId) {
        const { data, error } = await this.db
            .from('discounts')
            .select('*')
            .eq('type', 'product')
            .eq('product_id', productId)
            .eq('is_active', true);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data ?? [];
    }
    async getActiveEventDiscounts() {
        const now = new Date().toISOString();
        const { data, error } = await this.db
            .from('discounts')
            .select('*, events(*)')
            .eq('type', 'event')
            .eq('is_active', true);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return (data ?? []).filter((d) => d.events &&
            d.events.is_active &&
            d.events.start_date <= now &&
            d.events.end_date >= now);
    }
    async getCustomerDiscounts(customerId, tier) {
        const { data, error } = await this.db
            .from('discounts')
            .select('*')
            .eq('type', 'customer')
            .eq('is_active', true);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return (data ?? []).filter((d) => d.customer_id === customerId ||
            (d.customer_tier && d.customer_tier === tier));
    }
    async getInvoiceDiscounts(subtotal) {
        const { data, error } = await this.db
            .from('discounts')
            .select('*')
            .eq('type', 'invoice')
            .eq('is_active', true);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return (data ?? []).filter((d) => !d.min_invoice_amount || subtotal >= d.min_invoice_amount);
    }
    calcDiscountAmount(discount, baseAmount) {
        if (discount.discount_method === 'percentage') {
            return parseFloat(((baseAmount * discount.discount_value) / 100).toFixed(2));
        }
        return Math.min(discount.discount_value, baseAmount);
    }
};
exports.DiscountService = DiscountService;
exports.DiscountService = DiscountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], DiscountService);
//# sourceMappingURL=discount.service.js.map