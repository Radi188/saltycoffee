import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    findAll(category?: string, categoryId?: string): Promise<any[]>;
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    findOne(id: string): Promise<any>;
    create(dto: CreateProductDto): Promise<any>;
    update(id: string, dto: UpdateProductDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
