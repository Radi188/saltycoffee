import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';

// ── Original modules ───────────────────────────────────────────────────────
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';

import { CustomerController } from './customer/customer.controller';
import { CustomerService } from './customer/customer.service';

import { EventController } from './event/event.controller';
import { EventService } from './event/event.service';

import { DiscountController } from './discount/discount.controller';
import { DiscountService } from './discount/discount.service';

import { SaleOrderController } from './sale-order/sale-order.controller';
import { SaleOrderService } from './sale-order/sale-order.service';

import { SaleInvoiceController } from './sale-invoice/sale-invoice.controller';
import { SaleInvoiceService } from './sale-invoice/sale-invoice.service';

import { SaleReceiptController } from './sale-receipt/sale-receipt.controller';
import { SaleReceiptService } from './sale-receipt/sale-receipt.service';

// ── Extended modules ───────────────────────────────────────────────────────
import { CategoryController } from './category/category.controller';
import { CategoryService } from './category/category.service';

import { PaymentMethodController } from './payment-method/payment-method.controller';
import { PaymentMethodService } from './payment-method/payment-method.service';

import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

import { ExchangeRateController } from './exchange-rate/exchange-rate.controller';
import { ExchangeRateService } from './exchange-rate/exchange-rate.service';

import { StaffShiftController } from './staff-shift/staff-shift.controller';
import { StaffShiftService } from './staff-shift/staff-shift.service';

import { ReportController } from './report/report.controller';
import { ReportService } from './report/report.service';

import { ToppingsController } from './toppings/toppings.controller';
import { ToppingsService } from './toppings/toppings.service';

import { ProductSizesController } from './product-sizes/product-sizes.controller';
import { ProductSizesService } from './product-sizes/product-sizes.service';

import { BranchController } from './branch/branch.controller';
import { BranchService } from './branch/branch.service';

@Module({
  imports: [SupabaseModule],
  controllers: [
    // Core
    ProductController,
    CustomerController,
    EventController,
    DiscountController,
    SaleOrderController,
    SaleInvoiceController,
    SaleReceiptController,
    // Extended
    CategoryController,
    PaymentMethodController,
    UserController,
    ExchangeRateController,
    StaffShiftController,
    ReportController,
    ToppingsController,
    ProductSizesController,
    BranchController,
  ],
  providers: [
    // Core
    ProductService,
    CustomerService,
    EventService,
    DiscountService,
    SaleOrderService,
    SaleInvoiceService,
    SaleReceiptService,
    // Extended
    CategoryService,
    PaymentMethodService,
    UserService,
    ExchangeRateService,
    StaffShiftService,
    ReportService,
    ToppingsService,
    ProductSizesService,
    BranchService,
  ],
})
export class CoffeeShopModule {}
