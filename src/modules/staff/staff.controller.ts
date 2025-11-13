import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private svc: StaffService) {}
  @Get()
  list() { return this.svc.findAll(); }
  @Get(':id')
  get(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post()
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Get(':id/timings')
  getTimings(@Param('id') id: string) { return this.svc.getTimings(id); }

  @Post(':id/timings')
  upsertTimings(@Param('id') id: string, @Body() body: any[]) { return this.svc.upsertTimings(id, body); }

  @Post(':id/leaves')
  addLeave(@Param('id') id: string, @Body() body: any) { return this.svc.addLeave(id, body); }
}
