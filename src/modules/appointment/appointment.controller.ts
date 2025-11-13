import { Controller, Get, Post, Param, Body, Query, Put, Delete } from '@nestjs/common';
import { AppointmentService } from './appointment.service';

@Controller('appointments')
export class AppointmentController {
  constructor(private svc: AppointmentService) {}
  @Get()
  list(@Query() q: any) { return this.svc.findAll(q); }
  @Get(':id')
  get(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post()
  create(@Body() body: any) { return this.svc.create(body); }

  @Post('findMatchingDoctorsForIssues')
  findMatchingDoctors(@Body() body: { issues: string[]; timeWindow?: any; appointment_type?: string }) {
    return this.svc.findMatchingDoctorsForIssues(body);
  }

  @Get('doctor/:doctorId/next3Slots')
  nextSlots(@Param('doctorId') doctorId: string) { return this.svc.getDoctorNext3Slots(doctorId); }

  @Post('book')
  book(@Body() body: any) { return this.svc.book(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Delete(':id')
  cancel(@Param('id') id: string) { return this.svc.cancel(id); }

  @Post(':id/confirm')
  confirm(@Param('id') id: string) { return this.svc.transition(id, 'confirm'); }
  @Post(':id/checkin')
  checkin(@Param('id') id: string) { return this.svc.transition(id, 'checkin'); }
  @Post(':id/complete')
  complete(@Param('id') id: string) { return this.svc.transition(id, 'complete'); }
}
