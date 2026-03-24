import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
export declare class PaymentMethodController {
    private readonly paymentMethodService;
    constructor(paymentMethodService: PaymentMethodService);
    findAll(activeOnly?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreatePaymentMethodDto): Promise<any>;
    update(id: string, dto: UpdatePaymentMethodDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
