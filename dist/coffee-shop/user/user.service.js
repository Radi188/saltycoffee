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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const supabase_service_1 = require("../../supabase/supabase.service");
const SALT_ROUNDS = 10;
function sanitize(user) {
    if (!user)
        return user;
    const { password_hash: _, ...safe } = user;
    return safe;
}
let UserService = class UserService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get db() {
        return this.supabaseService.getClient();
    }
    async findAll(role) {
        let query = this.db
            .from('users')
            .select('id, username, name, role, is_active, branch_id, branches(id, name, address), created_at, updated_at')
            .order('name');
        if (role)
            query = query.eq('role', role);
        const { data, error } = await query;
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.db
            .from('users')
            .select('id, username, name, role, is_active, branch_id, branches(id, name, address), created_at, updated_at')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`User ${id} not found`);
        return data;
    }
    async create(dto) {
        const { data: existing } = await this.db
            .from('users')
            .select('id')
            .eq('username', dto.username)
            .single();
        if (existing)
            throw new common_1.ConflictException(`Username "${dto.username}" is already taken`);
        const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const { password: _, ...rest } = dto;
        const { data, error } = await this.db
            .from('users')
            .insert({
            ...rest,
            password_hash,
            role: dto.role ?? 'cashier',
            is_active: dto.is_active ?? true,
            branch_id: dto.branch_id ?? null,
            updated_at: new Date().toISOString(),
        })
            .select('id, username, name, role, is_active, branch_id, branches(id, name, address), created_at, updated_at')
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async update(id, dto) {
        await this.findOne(id);
        const payload = {
            ...dto,
            updated_at: new Date().toISOString(),
        };
        if (dto.password) {
            payload.password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
            delete payload.password;
        }
        const { data, error } = await this.db
            .from('users')
            .update(payload)
            .eq('id', id)
            .select('id, username, name, role, is_active, branch_id, branches(id, name, address), created_at, updated_at')
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async remove(id) {
        await this.findOne(id);
        const { error } = await this.db.from('users').delete().eq('id', id);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: `User ${id} deleted` };
    }
    async login(dto) {
        const { data: user, error } = await this.db
            .from('users')
            .select('*, branches(id, name, address, phone)')
            .eq('username', dto.username)
            .eq('is_active', true)
            .single();
        if (error || !user)
            throw new common_1.UnauthorizedException('Invalid username or password');
        const valid = await bcrypt.compare(dto.password, user.password_hash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid username or password');
        return sanitize(user);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UserService);
//# sourceMappingURL=user.service.js.map