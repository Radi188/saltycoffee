import { SupabaseService } from '../../supabase/supabase.service';
import { DiscountService } from '../discount/discount.service';
import { CreateSaleInvoiceDto } from './dto/create-sale-invoice.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { ApplyManualDiscountDto } from './dto/apply-manual-discount.dto';
export declare class SaleInvoiceService {
    private readonly supabaseService;
    private readonly discountService;
    constructor(supabaseService: SupabaseService, discountService: DiscountService);
    private get db();
    private generateInvoiceNumber;
    private recalcInvoiceTotals;
    findAll(status?: string, customerId?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateSaleInvoiceDto): Promise<any>;
    private autoApplyProductDiscounts;
    applyDiscount(invoiceId: string, dto: ApplyDiscountDto): Promise<any>;
    applyManualDiscount(invoiceId: string, dto: ApplyManualDiscountDto): Promise<any>;
    private validateDiscount;
    removeDiscount(invoiceId: string, discountId: string): Promise<any>;
    autoApplyAllDiscounts(invoiceId: string): Promise<any>;
    confirm(id: string): Promise<any>;
    cancel(id: string): Promise<any>;
}
