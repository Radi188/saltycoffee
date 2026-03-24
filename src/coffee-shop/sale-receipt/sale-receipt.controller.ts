import {
  Controller, Get, Post,
  Param, Body, Query,
} from '@nestjs/common';
import { SaleReceiptService } from './sale-receipt.service';
import { CreateSaleReceiptDto } from './dto/create-sale-receipt.dto';

@Controller('sale-receipts')
export class SaleReceiptController {
  constructor(private readonly saleReceiptService: SaleReceiptService) {}

  /**
   * GET /sale-receipts
   * Query: ?customerId=<uuid>&paymentMethod=cash
   */
  @Get()
  findAll(
    @Query('customerId') customerId?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.saleReceiptService.findAll(customerId, paymentMethod);
  }

  /** GET /sale-receipts/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleReceiptService.findOne(id);
  }

  /**
   * POST /sale-receipts
   * Generates a receipt from a confirmed invoice and marks the invoice as paid.
   * Body: { invoice_id, payment_method, amount_paid, note? }
   */
  @Post()
  create(@Body() dto: CreateSaleReceiptDto) {
    return this.saleReceiptService.create(dto);
  }
}
