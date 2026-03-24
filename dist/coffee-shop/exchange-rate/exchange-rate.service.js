"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRateService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ExchangeRateService = class ExchangeRateService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get db() {
        return this.supabaseService.getClient();
    }
    async findAll(fromCurrency, toCurrency) {
        let query = this.db
            .from('exchange_rates')
            .select('*')
            .order('effective_date', { ascending: false });
        if (fromCurrency)
            query = query.eq('from_currency', fromCurrency.toUpperCase());
        if (toCurrency)
            query = query.eq('to_currency', toCurrency.toUpperCase());
        const { data, error } = await query;
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.db
            .from('exchange_rates')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`Exchange rate ${id} not found`);
        return data;
    }
    async getLatestRate(fromCurrency, toCurrency) {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await this.db
            .from('exchange_rates')
            .select('*')
            .eq('from_currency', fromCurrency.toUpperCase())
            .eq('to_currency', toCurrency.toUpperCase())
            .eq('is_active', true)
            .lte('effective_date', today)
            .order('effective_date', { ascending: false })
            .limit(1)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`No active exchange rate found for ${fromCurrency} → ${toCurrency}`);
        return data;
    }
    async convert(amount, fromCurrency, toCurrency) {
        if (fromCurrency.toUpperCase() === toCurrency.toUpperCase())
            return { from_currency: fromCurrency, to_currency: toCurrency, rate: 1, result: amount };
        const rateRecord = await this.getLatestRate(fromCurrency, toCurrency);
        const result = parseFloat((amount * rateRecord.rate).toFixed(2));
        return {
            from_currency: fromCurrency.toUpperCase(),
            to_currency: toCurrency.toUpperCase(),
            rate: rateRecord.rate,
            original_amount: amount,
            result,
            effective_date: rateRecord.effective_date,
        };
    }
    async create(dto) {
        const effectiveDate = dto.effective_date ?? new Date().toISOString().slice(0, 10);
        const { data, error } = await this.db
            .from('exchange_rates')
            .upsert({
            is_active: true,
            ...dto,
            from_currency: dto.from_currency.toUpperCase(),
            to_currency: dto.to_currency.toUpperCase(),
            effective_date: effectiveDate,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'from_currency,to_currency,effective_date' })
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async update(id, dto) {
        await this.findOne(id);
        const { data, error } = await this.db
            .from('exchange_rates')
            .update({ ...dto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async remove(id) {
        await this.findOne(id);
        const { error } = await this.db.from('exchange_rates').delete().eq('id', id);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: `Exchange rate ${id} deleted` };
    }
};
exports.ExchangeRateService = ExchangeRateService;
exports.ExchangeRateService = ExchangeRateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ExchangeRateService);
//# sourceMappingURL=exchange-rate.service.js.map