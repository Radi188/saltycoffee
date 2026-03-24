import { SaleInvoiceService } from './sale-invoice.service';
import { CreateSaleInvoiceDto } from './dto/create-sale-invoice.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { ApplyManualDiscountDto } from './dto/apply-manual-discount.dto';
export declare class SaleInvoiceController {
    private readonly saleInvoiceService;
    constructor(saleInvoiceService: SaleInvoiceService);
    findAll(status?: string, customerId?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateSaleInvoiceDto): Promise<any>;
    applyDiscount(id: string, dto: ApplyDiscountDto): Promise<any>;
    applyManualDiscount(id: string, dto: ApplyManualDiscountDto): Promise<any>;
    autoApplyAllDiscounts(id: string): Promise<any>;
    removeDiscount(id: string, discountId: string): Promise<any>;
    confirm(id: string): Promise<any>;
    cancel(id: string): Promise<any>;
}
