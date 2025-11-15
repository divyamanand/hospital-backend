import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionController {
  constructor(private readonly svc: PrescriptionService) {}

  @Post()
  @Roles('admin','doctor')
  create(@Body() body: any, @Req() req: any) {
    if (req.user.role === 'doctor') return this.svc.createForDoctor(body, req.user.staffId);
    return this.svc.create(body);
  }

  @Get()
  @Roles('admin','doctor','inventory','pharmacist','patient')
  list(@Query() q: any, @Req() req: any) {
    const role = req.user.role;
    const filter: any = {};
    if (q.patient_id || q.patientId) filter.patientId = q.patient_id || q.patientId;
    if (q.doctor_id || q.doctorId) filter.doctorId = q.doctor_id || q.doctorId;
    if (q.from) filter.from = q.from;
    if (q.to) filter.to = q.to;
    const mapBasic = (rows: any[]) => rows.map(r => {
      const pUser = (r.patient as any)?.user || null;
      const dUser = (r.doctor as any)?.user || null;
      const patientName = pUser ? [pUser.firstName||'', pUser.lastName||''].join(' ').trim() || null : null;
      const doctorName = dUser ? [dUser.firstName||'', dUser.lastName||''].join(' ').trim() || null : null;
      return {
        id: r.id,
        patientName,
        doctorName,
        date: r.createdAt,
        diagnosis: r.diagnosis || null,
      };
    });
    if (role === 'admin') return this.svc.findAll(filter).then(mapBasic);
    if (role === 'doctor') return this.svc.findAllForDoctor(req.user.staffId, filter).then(mapBasic);
    if (role === 'inventory' || role === 'pharmacist') return this.svc.findAllForDispense(filter).then(mapBasic);
    if (role === 'patient') return this.svc.findAllForPatient(req.user.patientId, filter).then(mapBasic);
    throw new ForbiddenException();
  }

  @Get(':id')
  @Roles('admin','doctor','inventory','pharmacist','patient')
  async getOne(@Param('id') id: string, @Req() req: any) {
    const role = req.user.role;
    const row = await this.svc.findOne(id);
    if (!row) throw new NotFoundException();
    const allow = (
      role === 'admin' || role === 'inventory' || role === 'pharmacist' ||
      (role === 'doctor' && (row as any)?.doctor?.id === req.user.staffId) ||
      (role === 'patient' && (row as any)?.patient?.id === req.user.patientId)
    );
    if (!allow) throw new ForbiddenException();
    const pUser = (row.patient as any)?.user || null;
    const dUser = (row.doctor as any)?.user || null;
    const patientName = pUser ? [pUser.firstName||'', pUser.lastName||''].join(' ').trim() || null : null;
    const doctorName = dUser ? [dUser.firstName||'', dUser.lastName||''].join(' ').trim() || null : null;
    return {
      id: row.id,
      patientId: (row.patient as any)?.id || null,
      doctorId: (row.doctor as any)?.id || null,
      patientName,
      doctorName,
      diagnosis: row.diagnosis || null,
      notes: row.notes || null,
      items: Array.isArray(row.items) ? row.items.map((it: any) => ({
        id: it.id,
        name: it.name,
        dosage: it.dosage,
        duration: it.duration,
        quantity: it.quantity,
        dayDivide: it.dayDivide,
        method: it.method,
      })) : [],
      date: row.createdAt,
      nextReview: row.nextReview || null,
    };
  }

  @Put(':id')
  @Roles('admin','doctor')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    if (req.user.role === 'doctor' && !this.svc.isDoctorOwner(id, req.user.staffId)) throw new ForbiddenException();
    return this.svc.update(id, body);
  }

  @Post(':id/dispense')
  @Roles('admin','inventory','pharmacist')
  dispense(@Param('id') id: string) { return this.svc.dispense(id); }
}
