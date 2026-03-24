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
exports.SaleOrderController = void 0;
const common_1 = require("@nestjs/common");
const sale_order_service_1 = require("./sale-order.service");
const create_sale_order_dto_1 = require("./dto/create-sale-order.dto");
let SaleOrderController = class SaleOrderController {
    saleOrderService;
    constructor(saleOrderService) {
        this.saleOrderService = saleOrderService;
    }
    findAll(status, customerId) {
        return this.saleOrderService.findAll(status, customerId);
    }
    findOne(id) {
        return this.saleOrderService.findOne(id);
    }
    create(dto) {
        return this.saleOrderService.create(dto);
    }
    confirm(id) {
        return this.saleOrderService.confirm(id);
    }
    cancel(id) {
        return this.saleOrderService.cancel(id);
    }
};
exports.SaleOrderController = SaleOrderController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SaleOrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaleOrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sale_order_dto_1.CreateSaleOrderDto]),
    __metadata("design:returntype", void 0)
], SaleOrderController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaleOrderController.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaleOrderController.prototype, "cancel", null);
exports.SaleOrderController = SaleOrderController = __decorate([
    (0, common_1.Controller)('sale-orders'),
    __metadata("design:paramtypes", [sale_order_service_1.SaleOrderService])
], SaleOrderController);
//# sourceMappingURL=sale-order.controller.js.map