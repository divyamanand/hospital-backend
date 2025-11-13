import { Body, Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { RequirementService } from './requirement.service';

@Controller('requirements')
export class RequirementController {
  constructor(private readonly svc: RequirementService) {}

  @Post()
  create(@Body() body: any) { return this.svc.create(body); }

  @Get(':appointment_id')
  byAppointment(@Param('appointment_id') appointmentId: string) { return this.svc.findByAppointment(appointmentId); }

  @Post(':id/fulfill')
  fulfill(@Param('id') id: string, @Body() body: any) { return this.svc.fulfill(id, body); }

  // Staff allotment management
  @Get(':id/find-staff')
  findStaff(@Param('id') id: string) { return this.svc.findStaffForRequirement(id); }

  @Post(':id/allot-staff')
  allotStaff(@Param('id') id: string, @Body() body: { staffIds: string[]; notes?: string }) {
    return this.svc.allotStaff(id, body?.staffIds || [], body?.notes);
  }

  // Re-run suggestions on requirement update
  @Put(':id')
  updateRequirement(@Param('id') id: string, @Body() body: any) { return this.svc.updateRequirement(id, body); }

  // Allotment CRUD
  @Get(':id/allotments')
  listAllotments(@Param('id') id: string) { return this.svc.listAllotments(id); }
  @Get('allotments/:fulfillmentId')
  getAllotment(@Param('fulfillmentId') fulfillmentId: string) { return this.svc.getAllotment(fulfillmentId); }
  @Put('allotments/:fulfillmentId')
  updateAllotment(@Param('fulfillmentId') fulfillmentId: string, @Body() body: any) { return this.svc.updateAllotment(fulfillmentId, body); }
  @Delete('allotments/:fulfillmentId')
  deleteAllotment(@Param('fulfillmentId') fulfillmentId: string) { return this.svc.deleteAllotment(fulfillmentId); }
}
