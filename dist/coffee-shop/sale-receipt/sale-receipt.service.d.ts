import { SupabaseService } from '../../supabase/supabase.service';
import { CreateSaleReceiptDto } from './dto/create-sale-receipt.dto';
export declare class SaleReceiptService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    private generateReceiptNumber;
    findAll(customerId?: string, paymentMethod?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateSaleReceiptDto): Promise<any>;
}
