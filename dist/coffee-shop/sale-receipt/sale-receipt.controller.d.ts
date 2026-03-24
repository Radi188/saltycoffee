import { SaleReceiptService } from './sale-receipt.service';
import { CreateSaleReceiptDto } from './dto/create-sale-receipt.dto';
export declare class SaleReceiptController {
    private readonly saleReceiptService;
    constructor(saleReceiptService: SaleReceiptService);
    findAll(customerId?: string, paymentMethod?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateSaleReceiptDto): Promise<any>;
}
