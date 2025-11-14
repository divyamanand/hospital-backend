import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly svc: StatsService) {}

  @Get('overview')
  @Roles('admin','receptionist','inventory','pharmacist','room_manager')
  overview() { return this.svc.overview(); }

  @Get('appointments/today')
  @Roles('admin','receptionist','doctor')
  todaysAppointments() { return this.svc.todaysAppointments(); }

  @Get('appointments/last7')
  @Roles('admin','receptionist')
  last7() { return this.svc.appointmentsLast7Days(); }

  @Get('invitations/pending')
  @Roles('admin','receptionist')
  pendingInvites() { return this.svc.pendingInvitations(); }

  @Get('inventory/low-stock')
  @Roles('admin','inventory','pharmacist')
  lowStock(@Query('threshold') threshold?: string) { return this.svc.lowStockItems(threshold ? parseInt(threshold,10) : 10); }

  @Get('inventory/summary')
  @Roles('admin','inventory','pharmacist')
  inventorySummary() { return this.svc.inventorySummary(); }

  @Get('rooms/occupied')
  @Roles('admin','room_manager')
  occupiedRooms() { return this.svc.occupiedRooms(); }

  @Get('staff/on-leave')
  @Roles('admin','receptionist')
  staffOnLeave() { return this.svc.staffOnLeaveToday(); }

  @Get('activities/recent')
  @Roles('admin','receptionist')
  recentActivities() { return this.svc.recentActivities(); }

  @Get('requirements/snapshot')
  @Roles('admin','receptionist')
  requirementsSnapshot() { return this.svc.requirementsSnapshot(); }
}
