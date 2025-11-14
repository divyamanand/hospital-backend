import { Controller, Get, Post, Param, Body, Put, UseGuards, Req, ForbiddenException, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PatientOrDoctorGuard } from '../auth/patient-or-doctor.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private svc: PatientService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist')
  list(@Query() q: any) {
    const filter: any = {};
    if (q?.gender) filter.gender = q.gender;
    if (q?.minAge) filter.minAge = parseInt(q.minAge,10);
    if (q?.maxAge) filter.maxAge = parseInt(q.maxAge,10);
    return this.svc.findAll(filter);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','doctor','patient')
  async get(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role;
    if (role === 'admin' || role === 'receptionist') return this.svc.findOne(id);
    if (role === 'patient' && req.user?.patientId === id) return this.svc.findOne(id);
    if (role === 'doctor' && await this.svc.isDoctorLinkedToPatient(req.user?.staffId, id)) return this.svc.findOne(id);
    throw new ForbiddenException('Not allowed');
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist')
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','patient')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const role = req.user?.role;
    if (role === 'admin' || role === 'receptionist') return this.svc.update(id, body);
    if (role === 'patient' && req.user?.patientId === id) {
      const limited: any = {};
      if (body.phone) limited.phone = body.phone;
      if (body.insurance) limited.insurance = body.insurance;
      return this.svc.update(id, limited);
    }
    throw new ForbiddenException('Not allowed');
  }

  @Get(':id/doctors-from-prescription')
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist','doctor','patient')
  async doctorsFromPrescription(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role;
    if (role === 'admin' || role === 'receptionist') return this.svc.getDoctorsFromPrescriptions(id);
    if (role === 'patient' && req.user?.patientId === id) return this.svc.getDoctorsFromPrescriptions(id);
    if (role === 'doctor' && await this.svc.isDoctorLinkedToPatient(req.user?.staffId, id)) return this.svc.getDoctorsFromPrescriptions(id);
    throw new ForbiddenException('Not allowed');
  }
}
