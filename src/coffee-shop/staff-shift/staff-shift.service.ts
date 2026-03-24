import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';

@Injectable()
export class StaffShiftService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  // ─── Document Number ────────────────────────────────────────────────────────
  private async generateShiftNumber(): Promise<string> {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const { data, error } = await this.db.rpc('get_next_document_number', {
      p_prefix: 'SHF',
      p_date: date,
    });
    if (error) throw new InternalServerErrorException(error.message);
    return data as string;
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────
  async findAll(userId?: string, status?: string) {
    let query = this.db
      .from('staff_shifts')
      .select(
        '*, users(id, name, username, role), sale_receipts(id, receipt_number, total, payment_method, created_at)',
      )
      .order('opened_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('staff_shifts')
      .select(
        '*, users(id, name, username, role), sale_receipts(id, receipt_number, total, payment_method, payment_method_id, created_at)',
      )
      .eq('id', id)
      .single();
    if (error || !data)
      throw new NotFoundException(`Staff shift ${id} not found`);
    return data;
  }

  /** Returns the currently open shift for a user (if any) */
  async findOpenShift(userId: string) {
    const { data, error } = await this.db
      .from('staff_shifts')
      .select('*, users(id, name, username, role)')
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  /** Returns the currently open shift for a branch (if any) */
  async findOpenShiftByBranch(branchId: string) {
    const { data, error } = await this.db
      .from('staff_shifts')
      .select('*, users(id, name, username, role)')
      .eq('branch_id', branchId)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // ─── Open shift ──────────────────────────────────────────────────────────────
  async openShift(dto: OpenShiftDto) {
    // Verify user exists and get their branch
    const { data: user, error: uErr } = await this.db
      .from('users')
      .select('id, name, role, is_active, branch_id')
      .eq('id', dto.user_id)
      .single();
    if (uErr || !user)
      throw new NotFoundException(`User ${dto.user_id} not found`);
    if (!user.is_active)
      throw new BadRequestException(`User "${user.name}" is not active`);

    // Prevent double-open: one open shift per branch at a time
    if (user.branch_id) {
      const existing = await this.findOpenShiftByBranch(user.branch_id);
      if (existing)
        throw new ConflictException(
          `Branch already has an open shift: ${existing.shift_number}`,
        );
    } else {
      const existing = await this.findOpenShift(dto.user_id);
      if (existing)
        throw new ConflictException(
          `User "${user.name}" already has an open shift: ${existing.shift_number}`,
        );
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
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // ─── Close shift ─────────────────────────────────────────────────────────────
  async closeShift(id: string, dto: CloseShiftDto) {
    const shift = await this.findOne(id);
    if (shift.status !== 'open')
      throw new BadRequestException('Shift is already closed');

    // Calculate expected cash = opening_cash + total cash receipts in this shift
    const { data: receipts, error: rErr } = await this.db
      .from('sale_receipts')
      .select('total, payment_method')
      .eq('shift_id', id);
    if (rErr) throw new InternalServerErrorException(rErr.message);

    const cashSales = (receipts ?? [])
      .filter((r: any) => r.payment_method === 'cash')
      .reduce((sum: number, r: any) => sum + Number(r.total), 0);

    const expectedCash = parseFloat(
      (Number(shift.opening_cash) + cashSales).toFixed(2),
    );
    const cashDifference = parseFloat(
      (dto.closing_cash - expectedCash).toFixed(2),
    );

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
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // ─── Shift summary ───────────────────────────────────────────────────────────
  async getShiftSummary(id: string) {
    const shift = await this.findOne(id);

    const { data: receipts, error } = await this.db
      .from('sale_receipts')
      .select('id, receipt_number, total, discount_amount, subtotal, payment_method, amount_paid, created_at')
      .eq('shift_id', id)
      .order('created_at');
    if (error) throw new InternalServerErrorException(error.message);

    const allReceipts = receipts ?? [];
    const totalSales = allReceipts.reduce((s: number, r: any) => s + Number(r.total), 0);
    const totalDiscount = allReceipts.reduce((s: number, r: any) => s + Number(r.discount_amount), 0);
    const totalSubtotal = allReceipts.reduce((s: number, r: any) => s + Number(r.subtotal), 0);

    // Breakdown by payment method
    const byPayment: Record<string, { count: number; total: number }> = {};
    for (const r of allReceipts) {
      const method: string = r.payment_method;
      if (!byPayment[method]) byPayment[method] = { count: 0, total: 0 };
      byPayment[method].count++;
      byPayment[method].total = parseFloat(
        (byPayment[method].total + Number(r.total)).toFixed(2),
      );
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
}
