import { Controller, Get, UseGuards } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('specialties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpecialtyController {
  constructor(private readonly svc: SpecialtyService) {}
  @Get()
  @Roles('admin','receptionist','doctor','patient')
  list() { return this.svc.findAll(); }
}
