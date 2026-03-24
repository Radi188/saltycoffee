import { SupabaseService } from '../../supabase/supabase.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
export declare class StaffShiftService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    private generateShiftNumber;
    findAll(userId?: string, status?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findOpenShift(userId: string): Promise<any>;
    findOpenShiftByBranch(branchId: string): Promise<any>;
    openShift(dto: OpenShiftDto): Promise<any>;
    closeShift(id: string, dto: CloseShiftDto): Promise<any>;
    getShiftSummary(id: string): Promise<{
        shift: {
            id: any;
            shift_number: any;
            status: any;
            cashier: any;
            opening_cash: any;
            closing_cash: any;
            expected_cash: any;
            cash_difference: any;
            opened_at: any;
            closed_at: any;
            note: any;
        };
        summary: {
            total_receipts: number;
            total_subtotal: number;
            total_discount: number;
            total_sales: number;
            by_payment_method: Record<string, {
                count: number;
                total: number;
            }>;
        };
        receipts: {
            id: any;
            receipt_number: any;
            total: any;
            discount_amount: any;
            subtotal: any;
            payment_method: any;
            amount_paid: any;
            created_at: any;
        }[];
    }>;
}
