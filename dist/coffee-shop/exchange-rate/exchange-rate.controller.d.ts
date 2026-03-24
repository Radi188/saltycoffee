import { ExchangeRateService } from './exchange-rate.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
export declare class ExchangeRateController {
    private readonly exchangeRateService;
    constructor(exchangeRateService: ExchangeRateService);
    findAll(from?: string, to?: string): Promise<any[]>;
    getLatest(from: string, to: string): Promise<any>;
    convert(from: string, to: string, amount: string): Promise<{
        from_currency: string;
        to_currency: string;
        rate: number;
        result: number;
        original_amount?: undefined;
        effective_date?: undefined;
    } | {
        from_currency: string;
        to_currency: string;
        rate: any;
        original_amount: number;
        result: number;
        effective_date: any;
    }>;
    findOne(id: string): Promise<any>;
    create(dto: CreateExchangeRateDto): Promise<any>;
    update(id: string, dto: UpdateExchangeRateDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
