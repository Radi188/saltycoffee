import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    findAll(activeOnly?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateCategoryDto): Promise<any>;
    update(id: string, dto: UpdateCategoryDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
