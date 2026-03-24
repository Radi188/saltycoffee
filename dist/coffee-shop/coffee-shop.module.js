"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoffeeShopModule = void 0;
const common_1 = require("@nestjs/common");
const supabase_module_1 = require("../supabase/supabase.module");
const product_controller_1 = require("./product/product.controller");
const product_service_1 = require("./product/product.service");
const customer_controller_1 = require("./customer/customer.controller");
const customer_service_1 = require("./customer/customer.service");
const event_controller_1 = require("./event/event.controller");
const event_service_1 = require("./event/event.service");
const discount_controller_1 = require("./discount/discount.controller");
const discount_service_1 = require("./discount/discount.service");
const sale_order_controller_1 = require("./sale-order/sale-order.controller");
const sale_order_service_1 = require("./sale-order/sale-order.service");
const sale_invoice_controller_1 = require("./sale-invoice/sale-invoice.controller");
const sale_invoice_service_1 = require("./sale-invoice/sale-invoice.service");
const sale_receipt_controller_1 = require("./sale-receipt/sale-receipt.controller");
const sale_receipt_service_1 = require("./sale-receipt/sale-receipt.service");
const category_controller_1 = require("./category/category.controller");
const category_service_1 = require("./category/category.service");
const payment_method_controller_1 = require("./payment-method/payment-method.controller");
const payment_method_service_1 = require("./payment-method/payment-method.service");
const user_controller_1 = require("./user/user.controller");
const user_service_1 = require("./user/user.service");
const exchange_rate_controller_1 = require("./exchange-rate/exchange-rate.controller");
const exchange_rate_service_1 = require("./exchange-rate/exchange-rate.service");
const staff_shift_controller_1 = require("./staff-shift/staff-shift.controller");
const staff_shift_service_1 = require("./staff-shift/staff-shift.service");
const report_controller_1 = require("./report/report.controller");
const report_service_1 = require("./report/report.service");
const toppings_controller_1 = require("./toppings/toppings.controller");
const toppings_service_1 = require("./toppings/toppings.service");
const product_sizes_controller_1 = require("./product-sizes/product-sizes.controller");
const product_sizes_service_1 = require("./product-sizes/product-sizes.service");
const branch_controller_1 = require("./branch/branch.controller");
const branch_service_1 = require("./branch/branch.service");
let CoffeeShopModule = class CoffeeShopModule {
};
exports.CoffeeShopModule = CoffeeShopModule;
exports.CoffeeShopModule = CoffeeShopModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule],
        controllers: [
            product_controller_1.ProductController,
            customer_controller_1.CustomerController,
            event_controller_1.EventController,
            discount_controller_1.DiscountController,
            sale_order_controller_1.SaleOrderController,
            sale_invoice_controller_1.SaleInvoiceController,
            sale_receipt_controller_1.SaleReceiptController,
            category_controller_1.CategoryController,
            payment_method_controller_1.PaymentMethodController,
            user_controller_1.UserController,
            exchange_rate_controller_1.ExchangeRateController,
            staff_shift_controller_1.StaffShiftController,
            report_controller_1.ReportController,
            toppings_controller_1.ToppingsController,
            product_sizes_controller_1.ProductSizesController,
            branch_controller_1.BranchController,
        ],
        providers: [
            product_service_1.ProductService,
            customer_service_1.CustomerService,
            event_service_1.EventService,
            discount_service_1.DiscountService,
            sale_order_service_1.SaleOrderService,
            sale_invoice_service_1.SaleInvoiceService,
            sale_receipt_service_1.SaleReceiptService,
            category_service_1.CategoryService,
            payment_method_service_1.PaymentMethodService,
            user_service_1.UserService,
            exchange_rate_service_1.ExchangeRateService,
            staff_shift_service_1.StaffShiftService,
            report_service_1.ReportService,
            toppings_service_1.ToppingsService,
            product_sizes_service_1.ProductSizesService,
            branch_service_1.BranchService,
        ],
    })
], CoffeeShopModule);
//# sourceMappingURL=coffee-shop.module.js.map