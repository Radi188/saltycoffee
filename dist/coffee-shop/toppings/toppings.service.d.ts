import { SupabaseService } from '../../supabase/supabase.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
export declare class ToppingsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    findAll(activeOnly?: boolean): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateToppingDto): Promise<any>;
    update(id: string, dto: UpdateToppingDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
