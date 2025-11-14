import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly svc: LeaveService) {}

  @Get()
  @Roles('admin','receptionist')
  list(@Query() q: any) {
    const filter: any = {};
    if (q.staffId) filter.staffId = q.staffId;
    if (q.status) filter.status = q.status;
    if (q.from) filter.from = q.from;
    if (q.to) filter.to = q.to;
    if (q.active === 'true') filter.active = true;
    return this.svc.list(filter);
  }

  @Post()
  @Roles('admin','receptionist')
  create(@Body() body: any) { return this.svc.create(body); }

  @Get(':id')
  @Roles('admin','receptionist')
  get(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post(':id/approve')
  @Roles('admin','receptionist')
  approve(@Param('id') id: string) { return this.svc.transition(id,'approve'); }

  @Post(':id/reject')
  @Roles('admin','receptionist')
  reject(@Param('id') id: string, @Body() body: any) { return this.svc.transition(id,'reject', body?.reason); }

  @Post(':id/cancel')
  @Roles('admin','receptionist')
  cancel(@Param('id') id: string, @Body() body: any) { return this.svc.transition(id,'cancel', body?.reason); }

  @Post(':id/edit')
  @Roles('admin','receptionist')
  edit(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
}
