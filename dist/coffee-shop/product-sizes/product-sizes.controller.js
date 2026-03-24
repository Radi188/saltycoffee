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
exports.ProductSizesController = void 0;
const common_1 = require("@nestjs/common");
const product_sizes_service_1 = require("./product-sizes.service");
const create_product_size_dto_1 = require("./dto/create-product-size.dto");
let ProductSizesController = class ProductSizesController {
    productSizesService;
    constructor(productSizesService) {
        this.productSizesService = productSizesService;
    }
    findByProduct(productId) {
        return this.productSizesService.findByProduct(productId);
    }
    create(dto) {
        return this.productSizesService.create(dto);
    }
    update(id, dto) {
        return this.productSizesService.update(id, dto);
    }
    removeAllByLabel(label) {
        return this.productSizesService.removeAllByLabel(label);
    }
    remove(id) {
        return this.productSizesService.remove(id);
    }
};
exports.ProductSizesController = ProductSizesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductSizesController.prototype, "findByProduct", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_size_dto_1.CreateProductSizeDto]),
    __metadata("design:returntype", void 0)
], ProductSizesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductSizesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('by-label/:label'),
    __param(0, (0, common_1.Param)('label')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductSizesController.prototype, "removeAllByLabel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductSizesController.prototype, "remove", null);
exports.ProductSizesController = ProductSizesController = __decorate([
    (0, common_1.Controller)('product-sizes'),
    __metadata("design:paramtypes", [product_sizes_service_1.ProductSizesService])
], ProductSizesController);
//# sourceMappingURL=product-sizes.controller.js.map