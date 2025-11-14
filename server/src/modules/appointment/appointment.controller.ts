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
  @Roles('admin','receptionist','doctor','patient')
  list(@Query() q: any, @Req() req: any) {
    const role = req.user?.role;
    const sub = req.user?.id;
    const filter: any = {};
    if (q?.status) filter.status = q.status;
    if (q?.doctorId) filter.doctorId = q.doctorId;
    if (q?.patientId) filter.patientId = q.patientId;
    if (q?.from) filter.from = q.from;
    if (q?.to) filter.to = q.to;
    if (q?.timeframe) {
      const tf = q.timeframe;
      const now = new Date();
      let start: Date | null = null; let end: Date | null = null;
      if (tf === 'day') {
        start = new Date(now); start.setHours(0,0,0,0);
        end = new Date(start); end.setDate(start.getDate()+1);
      } else if (tf === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0,0,0,0);
        end = new Date(now.getFullYear(), now.getMonth()+1, 1, 0,0,0,0);
      } else if (tf === 'year') {
        start = new Date(now.getFullYear(), 0, 1, 0,0,0,0);
        end = new Date(now.getFullYear()+1, 0, 1, 0,0,0,0);
      }
      if (start && end) {
        filter.from = start.toISOString();
        filter.to = end.toISOString();
      }
    }
    if (q?.rangeStart && q?.rangeEnd) {
      filter.from = new Date(q.rangeStart).toISOString();
      filter.to = new Date(q.rangeEnd).toISOString();
    }
    if (role === 'patient') filter.patientId = sub;
    if (role === 'doctor') filter.doctorId = sub;
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
  @Roles('admin','receptionist','doctor','patient')
  createOrBook(@Body() body: any, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    const patientIdInput = body.patientId || body.patient_id || body.patient?.id;
    const doctorIdInput = body.doctorId || body.doctor_id || body.doctor?.id;
    const startAt = body.startAt;
    const endAt = body.endAt;
    if (role === 'patient' && patientIdInput && patientIdInput !== sub) throw new ForbiddenException('Patients can only book for self');
    if (role === 'doctor' && doctorIdInput && doctorIdInput !== sub) throw new ForbiddenException('Doctors can only book their own slots');
    const patientId = role === 'patient' ? sub : patientIdInput;
    const doctorId = role === 'doctor' ? sub : doctorIdInput;
    if (!patientId) throw new ForbiddenException('patientId required');
    if (!doctorId) throw new ForbiddenException('doctorId required');
    if (!startAt || !endAt) throw new ForbiddenException('startAt and endAt required');
    return this.svc.book({ patient: { id: patientId } as any, doctor: { id: doctorId } as any, startAt, endAt });
  }

  @Post('findMatchingDoctorsForIssues')
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','doctor','patient')
  findMatchingDoctors(@Body() body: { issues: string[]; timeWindow?: any; appointment_type?: string }) {
    return this.svc.findMatchingDoctorsForIssues(body);
  }

  @Get('doctor/:doctorId/next3Slots')
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','doctor')
  nextSlots(@Param('doctorId') doctorId: string, @Req() req: any) { return this.svc.getDoctorNext3Slots(doctorId); }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','doctor','patient')
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
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','patient')
  async cancelWithReason(@Param('id') id: string, @Body() body: { reason?: string }, @Req() req: any) {
    const appt = await this.svc.findOne(id);
    const role = req.user?.role; const sub = req.user?.id;
    if (!appt) return appt;
    if (role === 'admin' || role === 'receptionist') return this.svc.cancel(id, body?.reason);
    if (role === 'patient' && (appt.patient as any)?.id === sub) return this.svc.cancel(id, body?.reason);
    throw new ForbiddenException('Not allowed');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','patient')
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
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','doctor')
  patch(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.svc.update(id, body); }

  @Delete(':id/hard')
  @UseGuards(RolesGuard)
  @Roles('admin')
  hardDelete(@Param('id') id: string) { return this.svc.remove(id); }

  @Post(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','doctor')
  confirm(@Param('id') id: string, @Req() req: any) { return this.svc.transition(id, 'confirm'); }
  @Post(':id/checkin')
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','doctor')
  checkin(@Param('id') id: string, @Req() req: any) { return this.svc.transition(id, 'checkin'); }
  @Post(':id/complete')
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','doctor')
  complete(@Param('id') id: string, @Req() req: any) { return this.svc.transition(id, 'complete'); }
}
