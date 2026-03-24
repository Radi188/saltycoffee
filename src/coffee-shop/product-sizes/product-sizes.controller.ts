import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ProductSizesService } from './product-sizes.service';
import { CreateProductSizeDto } from './dto/create-product-size.dto';

@Controller('product-sizes')
export class ProductSizesController {
  constructor(private readonly productSizesService: ProductSizesService) {}

  @Get()
  findByProduct(@Query('productId') productId: string) {
    return this.productSizesService.findByProduct(productId);
  }

  @Post()
  create(@Body() dto: CreateProductSizeDto) {
    return this.productSizesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductSizeDto>) {
    return this.productSizesService.update(id, dto);
  }

  @Delete('by-label/:label')
  removeAllByLabel(@Param('label') label: string) {
    return this.productSizesService.removeAllByLabel(label);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productSizesService.remove(id);
  }
}
