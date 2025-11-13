import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';

@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly svc: PrescriptionService) {}

  @Post()
  create(@Body() body: any) { return this.svc.create(body); }

  @Get()
  list(@Query('patient_id') patientId?: string) { return this.svc.findAll(patientId); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Post(':id/dispense')
  dispense(@Param('id') id: string) { return this.svc.dispense(id); }
}
