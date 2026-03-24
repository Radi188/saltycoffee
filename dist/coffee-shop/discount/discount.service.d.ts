import { SupabaseService } from '../../supabase/supabase.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
export declare class DiscountService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    findAll(type?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateDiscountDto): Promise<any>;
    update(id: string, dto: UpdateDiscountDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getProductDiscounts(productId: string): Promise<any[]>;
    getActiveEventDiscounts(): Promise<any[]>;
    getCustomerDiscounts(customerId: string, tier: string): Promise<any[]>;
    getInvoiceDiscounts(subtotal: number): Promise<any[]>;
    calcDiscountAmount(discount: {
        discount_method: string;
        discount_value: number;
    }, baseAmount: number): number;
}
