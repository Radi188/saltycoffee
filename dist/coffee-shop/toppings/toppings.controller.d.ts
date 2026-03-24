import { ToppingsService } from './toppings.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
export declare class ToppingsController {
    private readonly toppingsService;
    constructor(toppingsService: ToppingsService);
    findAll(activeOnly?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateToppingDto): Promise<any>;
    update(id: string, dto: UpdateToppingDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
