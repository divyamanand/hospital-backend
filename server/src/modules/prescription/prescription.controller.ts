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
    if (role === 'admin') return this.svc.findAll(filter);
    if (role === 'doctor') return this.svc.findAllForDoctor(req.user.staffId, filter);
    if (role === 'inventory' || role === 'pharmacist') return this.svc.findAllForDispense(filter);
    if (role === 'patient') return this.svc.findAllForPatient(req.user.patientId, filter);
    throw new ForbiddenException();
  }

  @Get(':id')
  @Roles('admin','doctor','inventory','pharmacist','patient')
  async getOne(@Param('id') id: string, @Req() req: any) {
    const role = req.user.role;
    const row = await this.svc.findOne(id);
    if (!row) throw new NotFoundException();
    if (role === 'admin' || role === 'inventory' || role === 'pharmacist') return row;
    if (role === 'doctor') {
      if ((row as any)?.doctor?.id === req.user.staffId) return row;
      throw new ForbiddenException();
    }
    if (role === 'patient') {
      if ((row as any)?.patient?.id === req.user.patientId) return row;
      throw new ForbiddenException();
    }
    throw new ForbiddenException();
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
