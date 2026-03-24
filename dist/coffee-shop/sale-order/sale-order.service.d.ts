import { SupabaseService } from '../../supabase/supabase.service';
import { CreateSaleOrderDto } from './dto/create-sale-order.dto';
export declare class SaleOrderService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    private generateOrderNumber;
    findAll(status?: string, customerId?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateSaleOrderDto): Promise<any>;
    confirm(id: string): Promise<any>;
    cancel(id: string): Promise<any>;
}
