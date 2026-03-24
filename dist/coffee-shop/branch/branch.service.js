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
exports.BranchService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let BranchService = class BranchService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get db() {
        return this.supabaseService.getClient();
    }
    async findAll(activeOnly = false) {
        let query = this.db
            .from('branches')
            .select('*')
            .order('name');
        if (activeOnly)
            query = query.eq('is_active', true);
        const { data, error } = await query;
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.db
            .from('branches')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`Branch ${id} not found`);
        return data;
    }
    async create(dto) {
        const { data: existing } = await this.db
            .from('branches')
            .select('id')
            .eq('name', dto.name)
            .single();
        if (existing)
            throw new common_1.ConflictException(`Branch name "${dto.name}" is already taken`);
        const { data, error } = await this.db
            .from('branches')
            .insert({
            ...dto,
            is_active: dto.is_active ?? true,
            updated_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async update(id, dto) {
        await this.findOne(id);
        const { data, error } = await this.db
            .from('branches')
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
        const { error } = await this.db.from('branches').delete().eq('id', id);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: `Branch ${id} deleted` };
    }
};
exports.BranchService = BranchService;
exports.BranchService = BranchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], BranchService);
//# sourceMappingURL=branch.service.js.map