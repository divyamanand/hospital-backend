import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
}
