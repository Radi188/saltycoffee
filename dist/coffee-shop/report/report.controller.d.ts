import { ReportService } from './report.service';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    dailySummary(date: string, branchId?: string): Promise<{
        date: string;
        total_receipts: number;
        total_subtotal: number;
        total_discount: number;
        total_revenue: number;
        by_payment_method: Record<string, {
            count: number;
            total: number;
        }>;
    }>;
    revenueSummary(startDate: string, endDate: string, branchId?: string): Promise<{
        start_date: string;
        end_date: string;
        total_receipts: number;
        total_subtotal: number;
        total_discount: number;
        total_revenue: number;
        daily_breakdown: {
            date: string;
            receipts: number;
            revenue: number;
            discount: number;
        }[];
    }>;
    salesByProduct(startDate: string, endDate: string, branchId?: string): Promise<{
        start_date: string;
        end_date: string;
        products: {
            total_quantity: number;
            total_subtotal: number;
            total_discount: number;
            net_revenue: number;
            product_id: string;
            product_name: string;
        }[];
    }>;
    salesByCategory(startDate: string, endDate: string, branchId?: string): Promise<{
        start_date: string;
        end_date: string;
        categories: {
            total_quantity: number;
            net_revenue: number;
            category_id: string | null;
            category_name: string;
        }[];
    }>;
    paymentBreakdown(startDate: string, endDate: string, branchId?: string): Promise<{
        start_date: string;
        end_date: string;
        total_revenue: number;
        by_payment_method: Record<string, {
            count: number;
            total: number;
            total_discount: number;
        }>;
    }>;
    topProducts(startDate: string, endDate: string, limit?: string, branchId?: string): Promise<{
        products: {
            total_quantity: number;
            total_subtotal: number;
            total_discount: number;
            net_revenue: number;
            product_id: string;
            product_name: string;
        }[];
        start_date: string;
        end_date: string;
    }>;
    shiftHistory(startDate: string, endDate: string, userId?: string, branchId?: string): Promise<{
        start_date: string;
        end_date: string;
        shifts: any[];
    }>;
}
