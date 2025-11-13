import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly svc: RoomService) {}

  @Get()
  list() { return this.svc.findAll(); }
  @Post()
  create(@Body() body: any) { return this.svc.create(body); }
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Post(':id/book')
  book(@Param('id') id: string, @Body() body: any) { return this.svc.book(id, body); }
}
