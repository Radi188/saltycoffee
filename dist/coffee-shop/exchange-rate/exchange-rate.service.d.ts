import { SupabaseService } from '../../supabase/supabase.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
export declare class ExchangeRateService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    findAll(fromCurrency?: string, toCurrency?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    getLatestRate(fromCurrency: string, toCurrency: string): Promise<any>;
    convert(amount: number, fromCurrency: string, toCurrency: string): Promise<{
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
    create(dto: CreateExchangeRateDto): Promise<any>;
    update(id: string, dto: UpdateExchangeRateDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
