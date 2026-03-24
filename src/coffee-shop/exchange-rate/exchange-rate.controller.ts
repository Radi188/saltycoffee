import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query,
} from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Controller('exchange-rates')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  /** GET /exchange-rates?from=USD&to=KHR */
  @Get()
  findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.exchangeRateService.findAll(from, to);
  }

  /**
   * GET /exchange-rates/latest?from=USD&to=KHR
   * Returns the currently effective rate for a pair.
   */
  @Get('latest')
  getLatest(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.exchangeRateService.getLatestRate(from, to);
  }

  /**
   * GET /exchange-rates/convert?from=USD&to=KHR&amount=10
   * Converts amount using the latest active rate.
   */
  @Get('convert')
  convert(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount: string,
  ) {
    return this.exchangeRateService.convert(parseFloat(amount), from, to);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exchangeRateService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateExchangeRateDto) {
    return this.exchangeRateService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExchangeRateDto) {
    return this.exchangeRateService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exchangeRateService.remove(id);
  }
}
