import { SaleOrderService } from './sale-order.service';
import { CreateSaleOrderDto } from './dto/create-sale-order.dto';
export declare class SaleOrderController {
    private readonly saleOrderService;
    constructor(saleOrderService: SaleOrderService);
    findAll(status?: string, customerId?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateSaleOrderDto): Promise<any>;
    confirm(id: string): Promise<any>;
    cancel(id: string): Promise<any>;
}
