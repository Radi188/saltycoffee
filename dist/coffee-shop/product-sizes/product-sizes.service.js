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
exports.ProductSizesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ProductSizesService = class ProductSizesService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get db() {
        return this.supabaseService.getClient();
    }
    async findByProduct(productId) {
        const { data, error } = await this.db
            .from('product_sizes')
            .select('*')
            .eq('product_id', productId)
            .order('sort_order');
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async create(dto) {
        const { data, error } = await this.db
            .from('product_sizes')
            .insert(dto)
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async update(id, dto) {
        const { data, error } = await this.db
            .from('product_sizes')
            .update(dto)
            .eq('id', id)
            .select()
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`ProductSize ${id} not found`);
        return data;
    }
    async remove(id) {
        const { error } = await this.db.from('product_sizes').delete().eq('id', id);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: `ProductSize ${id} deleted` };
    }
    async removeAllByLabel(sizeLabel) {
        const { error, count } = await this.db
            .from('product_sizes')
            .delete({ count: 'exact' })
            .eq('size_label', sizeLabel);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: `Deleted all "${sizeLabel}" sizes`, deleted: count };
    }
};
exports.ProductSizesService = ProductSizesService;
exports.ProductSizesService = ProductSizesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ProductSizesService);
//# sourceMappingURL=product-sizes.service.js.map