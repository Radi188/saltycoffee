import {
  Controller, Get, Post, Delete,
  Param, Body, Query,
} from '@nestjs/common';
import { SaleInvoiceService } from './sale-invoice.service';
import { CreateSaleInvoiceDto } from './dto/create-sale-invoice.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { ApplyManualDiscountDto } from './dto/apply-manual-discount.dto';

@Controller('sale-invoices')
export class SaleInvoiceController {
  constructor(private readonly saleInvoiceService: SaleInvoiceService) {}

  /**
   * GET /sale-invoices
   * Query: ?status=confirmed&customerId=<uuid>
   */
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.saleInvoiceService.findAll(status, customerId);
  }

  /** GET /sale-invoices/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleInvoiceService.findOne(id);
  }

  /**
   * POST /sale-invoices
   * Generates an invoice from a sale order.
   * Product-level discounts are auto-applied per line item.
   * Body: { order_id, note? }
   */
  @Post()
  create(@Body() dto: CreateSaleInvoiceDto) {
    return this.saleInvoiceService.create(dto);
  }

  /**
   * POST /sale-invoices/:id/apply-discount
   * Manually apply a specific discount (event / customer / invoice type).
   * Body: { discount_id }
   */
  @Post(':id/apply-discount')
  applyDiscount(@Param('id') id: string, @Body() dto: ApplyDiscountDto) {
    return this.saleInvoiceService.applyDiscount(id, dto);
  }

  /**
   * POST /sale-invoices/:id/apply-manual-discount
   * Apply an ad-hoc percentage or fixed discount entered by the cashier.
   * Body: { discount_method: 'percentage'|'fixed', value: number, label?: string }
   */
  @Post(':id/apply-manual-discount')
  applyManualDiscount(
    @Param('id') id: string,
    @Body() dto: ApplyManualDiscountDto,
  ) {
    return this.saleInvoiceService.applyManualDiscount(id, dto);
  }

  /**
   * POST /sale-invoices/:id/auto-apply-discounts
   * Automatically find and apply all eligible discounts
   * (event, customer, invoice-level). Product discounts are already on items.
   */
  @Post(':id/auto-apply-discounts')
  autoApplyAllDiscounts(@Param('id') id: string) {
    return this.saleInvoiceService.autoApplyAllDiscounts(id);
  }

  /**
   * DELETE /sale-invoices/:id/discounts/:discountId
   * Remove a previously applied discount from a draft invoice.
   */
  @Delete(':id/discounts/:discountId')
  removeDiscount(
    @Param('id') id: string,
    @Param('discountId') discountId: string,
  ) {
    return this.saleInvoiceService.removeDiscount(id, discountId);
  }

  /** POST /sale-invoices/:id/confirm — confirm invoice ready for payment */
  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.saleInvoiceService.confirm(id);
  }

  /** POST /sale-invoices/:id/cancel */
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.saleInvoiceService.cancel(id);
  }
}
