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
exports.StaffShiftService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let StaffShiftService = class StaffShiftService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get db() {
        return this.supabaseService.getClient();
    }
    async generateShiftNumber() {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const { data, error } = await this.db.rpc('get_next_document_number', {
            p_prefix: 'SHF',
            p_date: date,
        });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findAll(userId, status) {
        let query = this.db
            .from('staff_shifts')
            .select('*, users(id, name, username, role), sale_receipts(id, receipt_number, total, payment_method, created_at)')
            .order('opened_at', { ascending: false });
        if (userId)
            query = query.eq('user_id', userId);
        if (status)
            query = query.eq('status', status);
        const { data, error } = await query;
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.db
            .from('staff_shifts')
            .select('*, users(id, name, username, role), sale_receipts(id, receipt_number, total, payment_method, payment_method_id, created_at)')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`Staff shift ${id} not found`);
        return data;
    }
    async findOpenShift(userId) {
        const { data, error } = await this.db
            .from('staff_shifts')
            .select('*, users(id, name, username, role)')
            .eq('user_id', userId)
            .eq('status', 'open')
            .order('opened_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findOpenShiftByBranch(branchId) {
        const { data, error } = await this.db
            .from('staff_shifts')
            .select('*, users(id, name, username, role)')
            .eq('branch_id', branchId)
            .eq('status', 'open')
            .order('opened_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async openShift(dto) {
        const { data: user, error: uErr } = await this.db
            .from('users')
            .select('id, name, role, is_active, branch_id')
            .eq('id', dto.user_id)
            .single();
        if (uErr || !user)
            throw new common_1.NotFoundException(`User ${dto.user_id} not found`);
        if (!user.is_active)
            throw new common_1.BadRequestException(`User "${user.name}" is not active`);
        if (user.branch_id) {
            const existing = await this.findOpenShiftByBranch(user.branch_id);
            if (existing)
                throw new common_1.ConflictException(`Branch already has an open shift: ${existing.shift_number}`);
        }
        else {
            const existing = await this.findOpenShift(dto.user_id);
            if (existing)
                throw new common_1.ConflictException(`User "${user.name}" already has an open shift: ${existing.shift_number}`);
        }
        const shiftNumber = await this.generateShiftNumber();
        const { data, error } = await this.db
            .from('staff_shifts')
            .insert({
            shift_number: shiftNumber,
            user_id: dto.user_id,
            branch_id: user.branch_id ?? null,
            status: 'open',
            opening_cash: dto.opening_cash,
            opened_at: new Date().toISOString(),
            note: dto.note ?? null,
        })
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async closeShift(id, dto) {
        const shift = await this.findOne(id);
        if (shift.status !== 'open')
            throw new common_1.BadRequestException('Shift is already closed');
        const { data: receipts, error: rErr } = await this.db
            .from('sale_receipts')
            .select('total, payment_method')
            .eq('shift_id', id);
        if (rErr)
            throw new common_1.InternalServerErrorException(rErr.message);
        const cashSales = (receipts ?? [])
            .filter((r) => r.payment_method === 'cash')
            .reduce((sum, r) => sum + Number(r.total), 0);
        const expectedCash = parseFloat((Number(shift.opening_cash) + cashSales).toFixed(2));
        const cashDifference = parseFloat((dto.closing_cash - expectedCash).toFixed(2));
        const { data, error } = await this.db
            .from('staff_shifts')
            .update({
            status: 'closed',
            closing_cash: dto.closing_cash,
            expected_cash: expectedCash,
            cash_difference: cashDifference,
            closed_at: new Date().toISOString(),
            note: dto.note ?? shift.note,
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async getShiftSummary(id) {
        const shift = await this.findOne(id);
        const { data: receipts, error } = await this.db
            .from('sale_receipts')
            .select('id, receipt_number, total, discount_amount, subtotal, payment_method, amount_paid, created_at')
            .eq('shift_id', id)
            .order('created_at');
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        const allReceipts = receipts ?? [];
        const totalSales = allReceipts.reduce((s, r) => s + Number(r.total), 0);
        const totalDiscount = allReceipts.reduce((s, r) => s + Number(r.discount_amount), 0);
        const totalSubtotal = allReceipts.reduce((s, r) => s + Number(r.subtotal), 0);
        const byPayment = {};
        for (const r of allReceipts) {
            const method = r.payment_method;
            if (!byPayment[method])
                byPayment[method] = { count: 0, total: 0 };
            byPayment[method].count++;
            byPayment[method].total = parseFloat((byPayment[method].total + Number(r.total)).toFixed(2));
        }
        return {
            shift: {
                id: shift.id,
                shift_number: shift.shift_number,
                status: shift.status,
                cashier: shift.users,
                opening_cash: shift.opening_cash,
                closing_cash: shift.closing_cash,
                expected_cash: shift.expected_cash,
                cash_difference: shift.cash_difference,
                opened_at: shift.opened_at,
                closed_at: shift.closed_at,
                note: shift.note,
            },
            summary: {
                total_receipts: allReceipts.length,
                total_subtotal: parseFloat(totalSubtotal.toFixed(2)),
                total_discount: parseFloat(totalDiscount.toFixed(2)),
                total_sales: parseFloat(totalSales.toFixed(2)),
                by_payment_method: byPayment,
            },
            receipts: allReceipts,
        };
    }
};
exports.StaffShiftService = StaffShiftService;
exports.StaffShiftService = StaffShiftService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], StaffShiftService);
//# sourceMappingURL=staff-shift.service.js.map