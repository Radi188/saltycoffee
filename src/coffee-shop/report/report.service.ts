import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ReportService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  private dayStart(date: string) {
    return `${date}T00:00:00.000Z`;
  }
  private dayEnd(date: string) {
    return `${date}T23:59:59.999Z`;
  }

  // ─── Daily Sales Summary ──────────────────────────────────────────────────────
  async dailySummary(date: string, branchId?: string) {
    let query = this.db
      .from('sale_receipts')
      .select('id, total, subtotal, discount_amount, payment_method, amount_paid, change_amount, created_at')
      .gte('created_at', this.dayStart(date))
      .lte('created_at', this.dayEnd(date))
      .order('created_at');
    if (branchId) query = query.eq('branch_id', branchId);

    const { data: receipts, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);

    const all = receipts ?? [];
    const totalReceipts = all.length;
    const totalSubtotal = all.reduce((s: number, r: any) => s + Number(r.subtotal), 0);
    const totalDiscount = all.reduce((s: number, r: any) => s + Number(r.discount_amount), 0);
    const totalRevenue = all.reduce((s: number, r: any) => s + Number(r.total), 0);

    const byPayment: Record<string, { count: number; total: number }> = {};
    for (const r of all) {
      const m: string = r.payment_method;
      if (!byPayment[m]) byPayment[m] = { count: 0, total: 0 };
      byPayment[m].count++;
      byPayment[m].total = parseFloat((byPayment[m].total + Number(r.total)).toFixed(2));
    }

    return {
      date,
      total_receipts: totalReceipts,
      total_subtotal: parseFloat(totalSubtotal.toFixed(2)),
      total_discount: parseFloat(totalDiscount.toFixed(2)),
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      by_payment_method: byPayment,
    };
  }

  // ─── Sales by Product ─────────────────────────────────────────────────────────
  async salesByProduct(startDate: string, endDate: string, branchId?: string) {
    let invQuery = this.db
      .from('sale_invoices')
      .select('id')
      .eq('status', 'paid')
      .gte('updated_at', this.dayStart(startDate))
      .lte('updated_at', this.dayEnd(endDate));
    if (branchId) invQuery = invQuery.eq('branch_id', branchId);

    const { data: invoices, error: invErr } = await invQuery;
    if (invErr) throw new InternalServerErrorException(invErr.message);

    const invoiceIds = (invoices ?? []).map((i: any) => i.id);
    if (invoiceIds.length === 0) return { start_date: startDate, end_date: endDate, products: [] };

    const { data: items, error: itemErr } = await this.db
      .from('sale_invoice_items')
      .select('product_id, product_name, quantity, unit_price, discount_amount, subtotal')
      .in('invoice_id', invoiceIds);
    if (itemErr) throw new InternalServerErrorException(itemErr.message);

    const productMap: Record<string, {
      product_id: string;
      product_name: string;
      total_quantity: number;
      total_subtotal: number;
      total_discount: number;
      net_revenue: number;
    }> = {};

    for (const item of (items ?? [])) {
      const key = item.product_id ?? item.product_name;
      if (!productMap[key]) {
        productMap[key] = {
          product_id: item.product_id,
          product_name: item.product_name,
          total_quantity: 0,
          total_subtotal: 0,
          total_discount: 0,
          net_revenue: 0,
        };
      }
      productMap[key].total_quantity += Number(item.quantity);
      productMap[key].total_subtotal += Number(item.unit_price) * Number(item.quantity);
      productMap[key].total_discount += Number(item.discount_amount);
      productMap[key].net_revenue += Number(item.subtotal);
    }

    const products = Object.values(productMap)
      .map((p) => ({
        ...p,
        total_quantity: parseFloat(p.total_quantity.toFixed(2)),
        total_subtotal: parseFloat(p.total_subtotal.toFixed(2)),
        total_discount: parseFloat(p.total_discount.toFixed(2)),
        net_revenue: parseFloat(p.net_revenue.toFixed(2)),
      }))
      .sort((a, b) => b.net_revenue - a.net_revenue);

    return { start_date: startDate, end_date: endDate, products };
  }

  // ─── Sales by Category ────────────────────────────────────────────────────────
  async salesByCategory(startDate: string, endDate: string, branchId?: string) {
    let invQuery = this.db
      .from('sale_invoices')
      .select('id')
      .eq('status', 'paid')
      .gte('updated_at', this.dayStart(startDate))
      .lte('updated_at', this.dayEnd(endDate));
    if (branchId) invQuery = invQuery.eq('branch_id', branchId);

    const { data: invoices, error: invErr } = await invQuery;
    if (invErr) throw new InternalServerErrorException(invErr.message);

    const invoiceIds = (invoices ?? []).map((i: any) => i.id);
    if (invoiceIds.length === 0)
      return { start_date: startDate, end_date: endDate, categories: [] };

    const { data: items, error: itemErr } = await this.db
      .from('sale_invoice_items')
      .select('subtotal, discount_amount, quantity, unit_price, products(id, name, category, category_id, categories(id, name))')
      .in('invoice_id', invoiceIds);
    if (itemErr) throw new InternalServerErrorException(itemErr.message);

    const catMap: Record<string, {
      category_id: string | null;
      category_name: string;
      total_quantity: number;
      net_revenue: number;
    }> = {};

    for (const item of (items ?? [])) {
      const product: any = (item as any).products;
      const cat: any = product?.categories;
      const catKey = cat?.id ?? product?.category ?? 'uncategorized';
      const catName = cat?.name ?? product?.category ?? 'Uncategorized';

      if (!catMap[catKey]) {
        catMap[catKey] = {
          category_id: cat?.id ?? null,
          category_name: catName,
          total_quantity: 0,
          net_revenue: 0,
        };
      }
      catMap[catKey].total_quantity += Number((item as any).quantity);
      catMap[catKey].net_revenue += Number((item as any).subtotal);
    }

    const categories = Object.values(catMap)
      .map((c) => ({
        ...c,
        total_quantity: parseFloat(c.total_quantity.toFixed(2)),
        net_revenue: parseFloat(c.net_revenue.toFixed(2)),
      }))
      .sort((a, b) => b.net_revenue - a.net_revenue);

    return { start_date: startDate, end_date: endDate, categories };
  }

  // ─── Sales by Payment Method ──────────────────────────────────────────────────
  async paymentBreakdown(startDate: string, endDate: string, branchId?: string) {
    let query = this.db
      .from('sale_receipts')
      .select('total, discount_amount, payment_method')
      .gte('created_at', this.dayStart(startDate))
      .lte('created_at', this.dayEnd(endDate));
    if (branchId) query = query.eq('branch_id', branchId);

    const { data: receipts, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);

    const byMethod: Record<string, { count: number; total: number; total_discount: number }> = {};
    for (const r of (receipts ?? [])) {
      const m: string = r.payment_method;
      if (!byMethod[m]) byMethod[m] = { count: 0, total: 0, total_discount: 0 };
      byMethod[m].count++;
      byMethod[m].total = parseFloat((byMethod[m].total + Number(r.total)).toFixed(2));
      byMethod[m].total_discount = parseFloat(
        (byMethod[m].total_discount + Number(r.discount_amount)).toFixed(2),
      );
    }

    const totalRevenue = Object.values(byMethod).reduce((s, m) => s + m.total, 0);

    return {
      start_date: startDate,
      end_date: endDate,
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      by_payment_method: byMethod,
    };
  }

  // ─── Shift History Report ─────────────────────────────────────────────────────
  async shiftHistory(startDate: string, endDate: string, userId?: string, branchId?: string) {
    let query = this.db
      .from('staff_shifts')
      .select('*, users(id, name, username)')
      .gte('opened_at', this.dayStart(startDate))
      .lte('opened_at', this.dayEnd(endDate))
      .order('opened_at', { ascending: false });
    if (userId)   query = query.eq('user_id', userId);
    if (branchId) query = query.eq('branch_id', branchId);

    const { data: shifts, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);

    const enriched = await Promise.all(
      (shifts ?? []).map(async (shift: any) => {
        const { data: receipts } = await this.db
          .from('sale_receipts')
          .select('total, payment_method')
          .eq('shift_id', shift.id);

        const all = receipts ?? [];
        const total_revenue = all.reduce((s: number, r: any) => s + Number(r.total), 0);
        const total_receipts = all.length;

        return {
          ...shift,
          total_receipts,
          total_revenue: parseFloat(total_revenue.toFixed(2)),
        };
      }),
    );

    return {
      start_date: startDate,
      end_date: endDate,
      shifts: enriched,
    };
  }

  // ─── Top Products ─────────────────────────────────────────────────────────────
  async topProducts(startDate: string, endDate: string, limit = 10, branchId?: string) {
    const result = await this.salesByProduct(startDate, endDate, branchId);
    return {
      ...result,
      products: result.products.slice(0, limit),
    };
  }

  // ─── Revenue Summary (date range) ────────────────────────────────────────────
  async revenueSummary(startDate: string, endDate: string, branchId?: string) {
    let query = this.db
      .from('sale_receipts')
      .select('total, subtotal, discount_amount, created_at')
      .gte('created_at', this.dayStart(startDate))
      .lte('created_at', this.dayEnd(endDate));
    if (branchId) query = query.eq('branch_id', branchId);

    const { data: receipts, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);

    const all = receipts ?? [];

    const byDay: Record<string, { date: string; receipts: number; revenue: number; discount: number }> = {};
    for (const r of all) {
      const day = (r.created_at as string).slice(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, receipts: 0, revenue: 0, discount: 0 };
      byDay[day].receipts++;
      byDay[day].revenue = parseFloat((byDay[day].revenue + Number(r.total)).toFixed(2));
      byDay[day].discount = parseFloat((byDay[day].discount + Number(r.discount_amount)).toFixed(2));
    }

    const dailyBreakdown = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));

    return {
      start_date: startDate,
      end_date: endDate,
      total_receipts: all.length,
      total_subtotal: parseFloat(all.reduce((s: number, r: any) => s + Number(r.subtotal), 0).toFixed(2)),
      total_discount: parseFloat(all.reduce((s: number, r: any) => s + Number(r.discount_amount), 0).toFixed(2)),
      total_revenue: parseFloat(all.reduce((s: number, r: any) => s + Number(r.total), 0).toFixed(2)),
      daily_breakdown: dailyBreakdown,
    };
  }
}
