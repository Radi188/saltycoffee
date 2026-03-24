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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
const path_1 = require("path");
const crypto_1 = require("crypto");
let ProductService = class ProductService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get db() {
        return this.supabaseService.getClient();
    }
    async findAll(category, categoryId) {
        let query = this.db
            .from('products')
            .select('*, categories(id, name), product_sizes(id, size_label, price, sort_order, is_active)')
            .order('name');
        if (category)
            query = query.eq('category', category);
        if (categoryId)
            query = query.eq('category_id', categoryId);
        const { data, error } = await query;
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.db
            .from('products')
            .select('*, categories(id, name), product_sizes(id, size_label, price, sort_order, is_active)')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`Product ${id} not found`);
        return data;
    }
    async create(dto) {
        const { data, error } = await this.db
            .from('products')
            .insert({ ...dto, updated_at: new Date().toISOString() })
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async update(id, dto) {
        await this.findOne(id);
        const { data, error } = await this.db
            .from('products')
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
        const { error } = await this.db.from('products').delete().eq('id', id);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: `Product ${id} deleted` };
    }
    async uploadImage(file) {
        const bucket = 'product-images';
        const ext = (0, path_1.extname)(file.originalname) || '.jpg';
        const path = `${(0, crypto_1.randomUUID)()}${ext}`;
        const { error } = await this.db.storage
            .from(bucket)
            .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        const { data } = this.db.storage.from(bucket).getPublicUrl(path);
        return { url: data.publicUrl };
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ProductService);
//# sourceMappingURL=product.service.js.map