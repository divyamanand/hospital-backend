import { Body, Controller, Get, Param, Post, Put, Delete, Query } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly svc: RoomService) {}

  @Get()
  list() { return this.svc.findAll(); }
  @Get(':id')
  get(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post()
  create(@Body() body: any) { return this.svc.create(body); }
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.svc.remove(id); }

  @Post(':id/book')
  book(@Param('id') id: string, @Body() body: any) { return this.svc.book(id, body); }

  @Post(':id/status')
  changeStatus(@Param('id') id: string, @Body() body: { status: string }) { return this.svc.changeStatus(id, body.status as any); }

  @Get('available/list')
  available(@Query('type') type?: string) { return this.svc.findAvailable(type as any); }
}
