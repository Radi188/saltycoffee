import { SupabaseService } from '../../supabase/supabase.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomerService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    findAll(tier?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateCustomerDto): Promise<any>;
    update(id: string, dto: UpdateCustomerDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
