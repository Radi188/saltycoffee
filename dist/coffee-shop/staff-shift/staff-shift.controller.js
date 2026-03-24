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
exports.StaffShiftController = void 0;
const common_1 = require("@nestjs/common");
const staff_shift_service_1 = require("./staff-shift.service");
const open_shift_dto_1 = require("./dto/open-shift.dto");
const close_shift_dto_1 = require("./dto/close-shift.dto");
let StaffShiftController = class StaffShiftController {
    staffShiftService;
    constructor(staffShiftService) {
        this.staffShiftService = staffShiftService;
    }
    findAll(userId, status) {
        return this.staffShiftService.findAll(userId, status);
    }
    findOpenShiftByBranch(branchId) {
        return this.staffShiftService.findOpenShiftByBranch(branchId);
    }
    findOpenShift(userId) {
        return this.staffShiftService.findOpenShift(userId);
    }
    findOne(id) {
        return this.staffShiftService.findOne(id);
    }
    getShiftSummary(id) {
        return this.staffShiftService.getShiftSummary(id);
    }
    openShift(dto) {
        return this.staffShiftService.openShift(dto);
    }
    closeShift(id, dto) {
        return this.staffShiftService.closeShift(id, dto);
    }
};
exports.StaffShiftController = StaffShiftController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StaffShiftController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('open/branch/:branchId'),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StaffShiftController.prototype, "findOpenShiftByBranch", null);
__decorate([
    (0, common_1.Get)('open/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StaffShiftController.prototype, "findOpenShift", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StaffShiftController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/summary'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StaffShiftController.prototype, "getShiftSummary", null);
__decorate([
    (0, common_1.Post)('open'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [open_shift_dto_1.OpenShiftDto]),
    __metadata("design:returntype", void 0)
], StaffShiftController.prototype, "openShift", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, close_shift_dto_1.CloseShiftDto]),
    __metadata("design:returntype", void 0)
], StaffShiftController.prototype, "closeShift", null);
exports.StaffShiftController = StaffShiftController = __decorate([
    (0, common_1.Controller)('staff-shifts'),
    __metadata("design:paramtypes", [staff_shift_service_1.StaffShiftService])
], StaffShiftController);
//# sourceMappingURL=staff-shift.controller.js.map