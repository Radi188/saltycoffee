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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleInvoiceController = void 0;
const common_1 = require("@nestjs/common");
const sale_invoice_service_1 = require("./sale-invoice.service");
const create_sale_invoice_dto_1 = require("./dto/create-sale-invoice.dto");
const apply_discount_dto_1 = require("./dto/apply-discount.dto");
const apply_manual_discount_dto_1 = require("./dto/apply-manual-discount.dto");
let SaleInvoiceController = class SaleInvoiceController {
    saleInvoiceService;
    constructor(saleInvoiceService) {
        this.saleInvoiceService = saleInvoiceService;
    }
    findAll(status, customerId) {
        return this.saleInvoiceService.findAll(status, customerId);
    }
    findOne(id) {
        return this.saleInvoiceService.findOne(id);
    }
    create(dto) {
        return this.saleInvoiceService.create(dto);
    }
    applyDiscount(id, dto) {
        return this.saleInvoiceService.applyDiscount(id, dto);
    }
    applyManualDiscount(id, dto) {
        return this.saleInvoiceService.applyManualDiscount(id, dto);
    }
    autoApplyAllDiscounts(id) {
        return this.saleInvoiceService.autoApplyAllDiscounts(id);
    }
    removeDiscount(id, discountId) {
        return this.saleInvoiceService.removeDiscount(id, discountId);
    }
    confirm(id) {
        return this.saleInvoiceService.confirm(id);
    }
    cancel(id) {
        return this.saleInvoiceService.cancel(id);
    }
};
exports.SaleInvoiceController = SaleInvoiceController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SaleInvoiceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaleInvoiceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sale_invoice_dto_1.CreateSaleInvoiceDto]),
    __metadata("design:returntype", void 0)
], SaleInvoiceController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/apply-discount'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, apply_discount_dto_1.ApplyDiscountDto]),
    __metadata("design:returntype", void 0)
], SaleInvoiceController.prototype, "applyDiscount", null);
__decorate([
    (0, common_1.Post)(':id/apply-manual-discount'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, apply_manual_discount_dto_1.ApplyManualDiscountDto]),
    __metadata("design:returntype", void 0)
], SaleInvoiceController.prototype, "applyManualDiscount", null);
__decorate([
    (0, common_1.Post)(':id/auto-apply-discounts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaleInvoiceController.prototype, "autoApplyAllDiscounts", null);
__decorate([
    (0, common_1.Delete)(':id/discounts/:discountId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('discountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SaleInvoiceController.prototype, "removeDiscount", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaleInvoiceController.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaleInvoiceController.prototype, "cancel", null);
exports.SaleInvoiceController = SaleInvoiceController = __decorate([
    (0, common_1.Controller)('sale-invoices'),
    __metadata("design:paramtypes", [sale_invoice_service_1.SaleInvoiceService])
], SaleInvoiceController);
//# sourceMappingURL=sale-invoice.controller.js.map