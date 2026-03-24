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
exports.SaleOrderService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let SaleOrderService = class SaleOrderService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get db() {
        return this.supabaseService.getClient();
    }
    async generateOrderNumber() {
        const date = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '');
        const { data, error } = await this.db.rpc('get_next_document_number', {
            p_prefix: 'SO',
            p_date: date,
        });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findAll(status, customerId) {
        let query = this.db
            .from('sale_orders')
            .select('*, customers(*), sale_order_items(*, products(*))')
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
            .from('sale_orders')
            .select('*, customers(*), sale_order_items(*, products(*))')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`Sale order ${id} not found`);
        return data;
    }
    async create(dto) {
        if (!dto.items || dto.items.length === 0)
            throw new common_1.BadRequestException('Order must have at least one item');
        const productIds = dto.items.map((i) => i.product_id);
        const { data: products, error: pErr } = await this.db
            .from('products')
            .select('id, name, base_price, is_active')
            .in('id', productIds);
        if (pErr)
            throw new common_1.InternalServerErrorException(pErr.message);
        const productMap = new Map(products.map((p) => [p.id, p]));
        for (const item of dto.items) {
            const product = productMap.get(item.product_id);
            if (!product)
                throw new common_1.BadRequestException(`Product ${item.product_id} not found`);
            if (!product.is_active)
                throw new common_1.BadRequestException(`Product "${product.name}" is not active`);
        }
        const orderItems = dto.items.map((item) => {
            const product = productMap.get(item.product_id);
            const unitPrice = item.unit_price ?? product.base_price;
            const subtotal = parseFloat((unitPrice * item.quantity).toFixed(2));
            return {
                product_id: item.product_id,
                product_name: product.name,
                quantity: item.quantity,
                unit_price: unitPrice,
                subtotal,
                size_label: item.size_label ?? null,
                selected_toppings: item.selected_toppings ?? [],
            };
        });
        const subtotal = parseFloat(orderItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));
        const orderNumber = await this.generateOrderNumber();
        const { data: order, error: oErr } = await this.db
            .from('sale_orders')
            .insert({
            order_number: orderNumber,
            customer_id: dto.customer_id ?? null,
            branch_id: dto.branch_id ?? null,
            status: 'draft',
            subtotal,
            note: dto.note ?? null,
            updated_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (oErr)
            throw new common_1.InternalServerErrorException(oErr.message);
        const itemsWithOrderId = orderItems.map((i) => ({
            ...i,
            order_id: order.id,
        }));
        const { error: iErr } = await this.db
            .from('sale_order_items')
            .insert(itemsWithOrderId);
        if (iErr)
            throw new common_1.InternalServerErrorException(iErr.message);
        return this.findOne(order.id);
    }
    async confirm(id) {
        const order = await this.findOne(id);
        if (order.status !== 'draft')
            throw new common_1.BadRequestException(`Order is already ${order.status}`);
        const { data, error } = await this.db
            .from('sale_orders')
            .update({ status: 'confirmed', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async cancel(id) {
        const order = await this.findOne(id);
        if (order.status === 'cancelled')
            throw new common_1.BadRequestException('Order is already cancelled');
        const { data, error } = await this.db
            .from('sale_orders')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
};
exports.SaleOrderService = SaleOrderService;
exports.SaleOrderService = SaleOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SaleOrderService);
//# sourceMappingURL=sale-order.service.js.map