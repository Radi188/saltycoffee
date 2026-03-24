import { SupabaseService } from '../../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    findAll(category?: string, categoryId?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateProductDto): Promise<any>;
    update(id: string, dto: UpdateProductDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
