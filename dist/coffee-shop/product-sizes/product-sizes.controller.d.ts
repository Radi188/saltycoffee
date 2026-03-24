import { ProductSizesService } from './product-sizes.service';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
export declare class ProductSizesController {
    private readonly productSizesService;
    constructor(productSizesService: ProductSizesService);
    findByProduct(productId: string): Promise<any[]>;
    create(dto: CreateProductSizeDto): Promise<any>;
    update(id: string, dto: Partial<CreateProductSizeDto>): Promise<any>;
    removeAllByLabel(label: string): Promise<{
        message: string;
        deleted: number | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
