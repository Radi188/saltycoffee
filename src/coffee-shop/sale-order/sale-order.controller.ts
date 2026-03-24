import {
  Controller, Get, Post,
  Param, Body, Query,
} from '@nestjs/common';
import { SaleOrderService } from './sale-order.service';
import { CreateSaleOrderDto } from './dto/create-sale-order.dto';

@Controller('sale-orders')
export class SaleOrderController {
  constructor(private readonly saleOrderService: SaleOrderService) {}

  /**
   * GET /sale-orders
   * Query: ?status=confirmed&customerId=<uuid>
   */
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.saleOrderService.findAll(status, customerId);
  }

  /** GET /sale-orders/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleOrderService.findOne(id);
  }

  /**
   * POST /sale-orders
   * Body: { customer_id?, items: [{ product_id, quantity, unit_price? }], note? }
   */
  @Post()
  create(@Body() dto: CreateSaleOrderDto) {
    return this.saleOrderService.create(dto);
  }

  /** POST /sale-orders/:id/confirm */
  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.saleOrderService.confirm(id);
  }

  /** POST /sale-orders/:id/cancel */
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.saleOrderService.cancel(id);
  }
}
