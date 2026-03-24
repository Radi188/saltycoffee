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
exports.ExchangeRateController = void 0;
const common_1 = require("@nestjs/common");
const exchange_rate_service_1 = require("./exchange-rate.service");
const create_exchange_rate_dto_1 = require("./dto/create-exchange-rate.dto");
const update_exchange_rate_dto_1 = require("./dto/update-exchange-rate.dto");
let ExchangeRateController = class ExchangeRateController {
    exchangeRateService;
    constructor(exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }
    findAll(from, to) {
        return this.exchangeRateService.findAll(from, to);
    }
    getLatest(from, to) {
        return this.exchangeRateService.getLatestRate(from, to);
    }
    convert(from, to, amount) {
        return this.exchangeRateService.convert(parseFloat(amount), from, to);
    }
    findOne(id) {
        return this.exchangeRateService.findOne(id);
    }
    create(dto) {
        return this.exchangeRateService.create(dto);
    }
    update(id, dto) {
        return this.exchangeRateService.update(id, dto);
    }
    remove(id) {
        return this.exchangeRateService.remove(id);
    }
};
exports.ExchangeRateController = ExchangeRateController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ExchangeRateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('latest'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ExchangeRateController.prototype, "getLatest", null);
__decorate([
    (0, common_1.Get)('convert'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ExchangeRateController.prototype, "convert", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExchangeRateController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_exchange_rate_dto_1.CreateExchangeRateDto]),
    __metadata("design:returntype", void 0)
], ExchangeRateController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_exchange_rate_dto_1.UpdateExchangeRateDto]),
    __metadata("design:returntype", void 0)
], ExchangeRateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExchangeRateController.prototype, "remove", null);
exports.ExchangeRateController = ExchangeRateController = __decorate([
    (0, common_1.Controller)('exchange-rates'),
    __metadata("design:paramtypes", [exchange_rate_service_1.ExchangeRateService])
], ExchangeRateController);
//# sourceMappingURL=exchange-rate.controller.js.map