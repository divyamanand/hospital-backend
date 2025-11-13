import { Controller, Get } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';

@Controller('specialties')
export class SpecialtyController {
  constructor(private readonly svc: SpecialtyService) {}
  @Get()
  list() { return this.svc.findAll(); }
}
