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
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const report_service_1 = require("./report.service");
let ReportController = class ReportController {
    reportService;
    constructor(reportService) {
        this.reportService = reportService;
    }
    dailySummary(date, branchId) {
        const d = date ?? new Date().toISOString().slice(0, 10);
        return this.reportService.dailySummary(d, branchId);
    }
    revenueSummary(startDate, endDate, branchId) {
        const today = new Date().toISOString().slice(0, 10);
        return this.reportService.revenueSummary(startDate ?? today, endDate ?? today, branchId);
    }
    salesByProduct(startDate, endDate, branchId) {
        const today = new Date().toISOString().slice(0, 10);
        return this.reportService.salesByProduct(startDate ?? today, endDate ?? today, branchId);
    }
    salesByCategory(startDate, endDate, branchId) {
        const today = new Date().toISOString().slice(0, 10);
        return this.reportService.salesByCategory(startDate ?? today, endDate ?? today, branchId);
    }
    paymentBreakdown(startDate, endDate, branchId) {
        const today = new Date().toISOString().slice(0, 10);
        return this.reportService.paymentBreakdown(startDate ?? today, endDate ?? today, branchId);
    }
    topProducts(startDate, endDate, limit, branchId) {
        const today = new Date().toISOString().slice(0, 10);
        return this.reportService.topProducts(startDate ?? today, endDate ?? today, limit ? parseInt(limit) : 10, branchId);
    }
    shiftHistory(startDate, endDate, userId, branchId) {
        const today = new Date().toISOString().slice(0, 10);
        return this.reportService.shiftHistory(startDate ?? today, endDate ?? today, userId, branchId);
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, common_1.Get)('daily-summary'),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "dailySummary", null);
__decorate([
    (0, common_1.Get)('revenue-summary'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "revenueSummary", null);
__decorate([
    (0, common_1.Get)('sales-by-product'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "salesByProduct", null);
__decorate([
    (0, common_1.Get)('sales-by-category'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "salesByCategory", null);
__decorate([
    (0, common_1.Get)('payment-breakdown'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "paymentBreakdown", null);
__decorate([
    (0, common_1.Get)('top-products'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "topProducts", null);
__decorate([
    (0, common_1.Get)('shift-history'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "shiftHistory", null);
exports.ReportController = ReportController = __decorate([
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [report_service_1.ReportService])
], ReportController);
//# sourceMappingURL=report.controller.js.map