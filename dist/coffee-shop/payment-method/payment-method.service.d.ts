import { SupabaseService } from '../../supabase/supabase.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
export declare class PaymentMethodService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    findAll(activeOnly?: boolean): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByCode(code: string): Promise<any>;
    create(dto: CreatePaymentMethodDto): Promise<any>;
    update(id: string, dto: UpdatePaymentMethodDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
