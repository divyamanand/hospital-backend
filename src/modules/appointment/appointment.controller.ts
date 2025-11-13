import { Controller, Get, Post, Param, Body, Query, Put, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private svc: AppointmentService) {}
  @Get()
  @UseGuards(RolesGuard)
  list(@Query() q: any, @Req() req: any) {
    const role = req.user?.role;
    const sub = req.user?.id;
    const filter = { ...(q || {}) };
    if (role === 'patient') filter.patient_id = sub;
    if (role === 'doctor') filter.doctor_id = sub;
    return this.svc.findAll(filter);
  }
  @Get(':id')
  async get(@Param('id') id: string, @Req() req: any) {
    const appt = await this.svc.findOne(id);
    const role = req.user?.role; const sub = req.user?.id;
    if (!appt) return appt;
    if (role === 'admin' || role === 'receptionist') return appt;
    if (role === 'patient' && (appt.patient as any)?.id === sub) return appt;
    if (role === 'doctor' && (appt.doctor as any)?.id === sub) return appt;
    throw new ForbiddenException('Not allowed');
  }
  @Post()
  @UseGuards(RolesGuard)
  createOrBook(@Body() body: any, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'patient') {
      const pid = (body?.patient?.id) || body?.patient_id;
      if (pid && pid !== sub) throw new ForbiddenException('Patients can only book for self');
      body.patient = { id: sub };
    }
    if (role === 'doctor') {
      // Ensure doctor is self
      const did = (body?.doctor?.id) || body?.doctor_id;
      if (did && did !== sub) throw new ForbiddenException('Doctors can only book their own slots');
      body.doctor = { id: sub };
    }
    return this.svc.book(body);
  }

  @Post('findMatchingDoctorsForIssues')
  findMatchingDoctors(@Body() body: { issues: string[]; timeWindow?: any; appointment_type?: string }) {
    return this.svc.findMatchingDoctorsForIssues(body);
  }

  @Get('doctor/:doctorId/next3Slots')
  nextSlots(@Param('doctorId') doctorId: string) { return this.svc.getDoctorNext3Slots(doctorId); }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const appt = await this.svc.findOne(id);
    const role = req.user?.role; const sub = req.user?.id;
    if (!appt) return appt;
    if (role === 'admin' || role === 'receptionist') return this.svc.update(id, body);
    if (role === 'patient' && (appt.patient as any)?.id === sub) return this.svc.update(id, body);
    if (role === 'doctor' && (appt.doctor as any)?.id === sub) return this.svc.update(id, body);
    throw new ForbiddenException('Not allowed');
  }

  @Post(':id/cancel')
  cancelWithReason(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.svc.cancel(id, body?.reason);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @Req() req: any) {
    const appt = await this.svc.findOne(id);
    const role = req.user?.role; const sub = req.user?.id;
    if (!appt) return appt;
    if (role === 'admin' || role === 'receptionist') return this.svc.cancel(id);
    if (role === 'patient' && (appt.patient as any)?.id === sub) return this.svc.cancel(id);
    if (role === 'doctor' && (appt.doctor as any)?.id === sub) return this.svc.cancel(id);
    throw new ForbiddenException('Not allowed');
  }

  @Put(':id/patch')
  patch(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Delete(':id/hard')
  hardDelete(@Param('id') id: string) { return this.svc.remove(id); }

  @Post(':id/confirm')
  confirm(@Param('id') id: string) { return this.svc.transition(id, 'confirm'); }
  @Post(':id/checkin')
  checkin(@Param('id') id: string) { return this.svc.transition(id, 'checkin'); }
  @Post(':id/complete')
  complete(@Param('id') id: string) { return this.svc.transition(id, 'complete'); }
}
