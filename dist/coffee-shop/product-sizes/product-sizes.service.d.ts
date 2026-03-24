import { SupabaseService } from '../../supabase/supabase.service';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
export declare class ProductSizesService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    findByProduct(productId: string): Promise<any[]>;
    create(dto: CreateProductSizeDto): Promise<any>;
    update(id: string, dto: Partial<CreateProductSizeDto>): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    removeAllByLabel(sizeLabel: string): Promise<{
        message: string;
        deleted: number | null;
    }>;
}
