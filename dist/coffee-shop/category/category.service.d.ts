import { SupabaseService } from '../../supabase/supabase.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoryService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    findAll(activeOnly?: boolean): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateCategoryDto): Promise<any>;
    update(id: string, dto: UpdateCategoryDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
