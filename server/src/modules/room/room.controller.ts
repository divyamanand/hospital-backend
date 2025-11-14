import { Body, Controller, Get, Param, Post, Put, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomController {
  constructor(private readonly svc: RoomService) {}

  @Get()
  @Roles('admin','room_manager')
  list(@Query() q: any) {
    const filter: any = {};
    if (q.status) filter.status = q.status;
    if (q.type) filter.type = q.type;
    if (q.capacityMin) filter.capacityMin = parseInt(q.capacityMin,10);
    if (q.capacityMax) filter.capacityMax = parseInt(q.capacityMax,10);
    if (q.patientId) filter.patientId = q.patientId;
    if (q.available === 'true') filter.available = true;
    return this.svc.findAll(filter);
  }
  @Get(':id')
  @Roles('admin','room_manager')
  get(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post()
  @Roles('admin','room_manager')
  create(@Body() body: any) { return this.svc.create(body); }
  @Put(':id')
  @Roles('admin','room_manager')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id')
  @Roles('admin','room_manager')
  remove(@Param('id') id: string) { return this.svc.remove(id); }

  @Post(':id/book')
  @Roles('admin','room_manager')
  book(@Param('id') id: string, @Body() body: any) { return this.svc.book(id, body); }

  @Patch(':id/status')
  @Roles('admin','room_manager')
  changeStatus(@Param('id') id: string, @Body() body: { status: string }) { return this.svc.changeStatus(id, body.status as any); }

  @Post(':id/assign')
  @Roles('admin','room_manager')
  assign(@Param('id') id: string, @Body() body: { patientId: string }) { return this.svc.assign(id, body); }

  @Get('available/list')
  @Roles('admin','room_manager')
  available(@Query('type') type?: string) { return this.svc.findAvailable(type as any); }
}
