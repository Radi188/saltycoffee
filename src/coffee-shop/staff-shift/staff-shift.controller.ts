import {
  Controller, Get, Post,
  Param, Body, Query,
} from '@nestjs/common';
import { StaffShiftService } from './staff-shift.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';

@Controller('staff-shifts')
export class StaffShiftController {
  constructor(private readonly staffShiftService: StaffShiftService) {}

  /**
   * GET /staff-shifts
   * Query: ?userId=<uuid>&status=open|closed
   */
  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.staffShiftService.findAll(userId, status);
  }

  /** GET /staff-shifts/open/branch/:branchId — get the current open shift for a branch */
  @Get('open/branch/:branchId')
  findOpenShiftByBranch(@Param('branchId') branchId: string) {
    return this.staffShiftService.findOpenShiftByBranch(branchId);
  }

  /** GET /staff-shifts/open/:userId — get the current open shift for a user */
  @Get('open/:userId')
  findOpenShift(@Param('userId') userId: string) {
    return this.staffShiftService.findOpenShift(userId);
  }

  /** GET /staff-shifts/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffShiftService.findOne(id);
  }

  /** GET /staff-shifts/:id/summary — detailed shift summary with sales breakdown */
  @Get(':id/summary')
  getShiftSummary(@Param('id') id: string) {
    return this.staffShiftService.getShiftSummary(id);
  }

  /**
   * POST /staff-shifts/open
   * Cashier opens their shift.
   * Body: { user_id, opening_cash, note? }
   */
  @Post('open')
  openShift(@Body() dto: OpenShiftDto) {
    return this.staffShiftService.openShift(dto);
  }

  /**
   * POST /staff-shifts/:id/close
   * Cashier closes their shift.
   * Body: { closing_cash, note? }
   */
  @Post(':id/close')
  closeShift(@Param('id') id: string, @Body() dto: CloseShiftDto) {
    return this.staffShiftService.closeShift(id, dto);
  }
}
