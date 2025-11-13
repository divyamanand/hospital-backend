import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AppointmentService } from './appointment.service';

@Controller('appointments')
export class AppointmentController {
  constructor(private svc: AppointmentService) {}
  @Get()
  list() { return this.svc.findAll(); }
  @Get(':id')
  get(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post()
  create(@Body() body: any) { return this.svc.create(body); }
}
