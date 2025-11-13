import { Controller, Get, Post, Param, Body, Put, UseGuards, Req, ForbiddenException } from '@nestjs/common';
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
  list() { return this.svc.findAll(); }

  @Get(':id')
  @UseGuards(RolesGuard, PatientOrDoctorGuard)
  get(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin','receptionist')
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  @UseGuards(RolesGuard, PatientOrDoctorGuard)
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Get(':id/doctors-from-prescription')
  @UseGuards(RolesGuard, PatientOrDoctorGuard)
  doctorsFromPrescription(@Param('id') id: string) { return this.svc.getDoctorsFromPrescriptions(id); }
}
