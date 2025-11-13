import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { PatientService } from './patient.service';

@Controller('patients')
export class PatientController {
  constructor(private svc: PatientService) {}

  @Get()
  list() { return this.svc.findAll(); }

  @Get(':id')
  get(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Get(':id/doctors-from-prescription')
  doctorsFromPrescription(@Param('id') id: string) { return this.svc.getDoctorsFromPrescriptions(id); }
}
