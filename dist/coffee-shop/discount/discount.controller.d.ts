import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
export declare class DiscountController {
    private readonly discountService;
    constructor(discountService: DiscountService);
    findAll(type?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateDiscountDto): Promise<any>;
    update(id: string, dto: UpdateDiscountDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
