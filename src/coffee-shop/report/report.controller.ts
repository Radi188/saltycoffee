import { Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('daily-summary')
  dailySummary(
    @Query('date')     date: string,
    @Query('branchId') branchId?: string,
  ) {
    const d = date ?? new Date().toISOString().slice(0, 10);
    return this.reportService.dailySummary(d, branchId);
  }

  @Get('revenue-summary')
  revenueSummary(
    @Query('startDate') startDate: string,
    @Query('endDate')   endDate: string,
    @Query('branchId')  branchId?: string,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    return this.reportService.revenueSummary(startDate ?? today, endDate ?? today, branchId);
  }

  @Get('sales-by-product')
  salesByProduct(
    @Query('startDate') startDate: string,
    @Query('endDate')   endDate: string,
    @Query('branchId')  branchId?: string,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    return this.reportService.salesByProduct(startDate ?? today, endDate ?? today, branchId);
  }

  @Get('sales-by-category')
  salesByCategory(
    @Query('startDate') startDate: string,
    @Query('endDate')   endDate: string,
    @Query('branchId')  branchId?: string,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    return this.reportService.salesByCategory(startDate ?? today, endDate ?? today, branchId);
  }

  @Get('payment-breakdown')
  paymentBreakdown(
    @Query('startDate') startDate: string,
    @Query('endDate')   endDate: string,
    @Query('branchId')  branchId?: string,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    return this.reportService.paymentBreakdown(startDate ?? today, endDate ?? today, branchId);
  }

  @Get('top-products')
  topProducts(
    @Query('startDate') startDate: string,
    @Query('endDate')   endDate: string,
    @Query('limit')     limit?: string,
    @Query('branchId')  branchId?: string,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    return this.reportService.topProducts(
      startDate ?? today,
      endDate ?? today,
      limit ? parseInt(limit) : 10,
      branchId,
    );
  }

  @Get('shift-history')
  shiftHistory(
    @Query('startDate') startDate: string,
    @Query('endDate')   endDate: string,
    @Query('userId')    userId?: string,
    @Query('branchId')  branchId?: string,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    return this.reportService.shiftHistory(
      startDate ?? today,
      endDate ?? today,
      userId,
      branchId,
    );
  }
}
