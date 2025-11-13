import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { RequirementService } from './requirement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('requirements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequirementController {
  constructor(private readonly svc: RequirementService) {}

  @Post()
  @Roles('admin','receptionist','inventory')
  create(@Body() body: any) { return this.svc.create(body); }

  @Get(':appointment_id')
  @Roles('admin','receptionist','inventory')
  byAppointment(@Param('appointment_id') appointmentId: string) { return this.svc.findByAppointment(appointmentId); }

  @Post(':id/fulfill')
  @Roles('admin','receptionist','inventory')
  fulfill(@Param('id') id: string, @Body() body: any) { return this.svc.fulfill(id, body); }

  // Staff allotment management
  @Get(':id/find-staff')
  @Roles('admin','receptionist')
  findStaff(@Param('id') id: string) { return this.svc.findStaffForRequirement(id); }

  @Post(':id/allot-staff')
  @Roles('admin','receptionist')
  allotStaff(@Param('id') id: string, @Body() body: { staffIds: string[]; notes?: string }) {
    return this.svc.allotStaff(id, body?.staffIds || [], body?.notes);
  }

  // Re-run suggestions on requirement update
  @Put(':id')
  @Roles('admin','receptionist','inventory')
  updateRequirement(@Param('id') id: string, @Body() body: any) { return this.svc.updateRequirement(id, body); }

  // Allotment CRUD
  @Get(':id/allotments')
  @Roles('admin','receptionist','inventory')
  listAllotments(@Param('id') id: string) { return this.svc.listAllotments(id); }
  @Get('allotments/:fulfillmentId')
  @Roles('admin','receptionist','inventory')
  getAllotment(@Param('fulfillmentId') fulfillmentId: string) { return this.svc.getAllotment(fulfillmentId); }
  @Put('allotments/:fulfillmentId')
  @Roles('admin','receptionist','inventory')
  updateAllotment(@Param('fulfillmentId') fulfillmentId: string, @Body() body: any) { return this.svc.updateAllotment(fulfillmentId, body); }
  @Delete('allotments/:fulfillmentId')
  @Roles('admin','receptionist','inventory')
  deleteAllotment(@Param('fulfillmentId') fulfillmentId: string) { return this.svc.deleteAllotment(fulfillmentId); }
}
