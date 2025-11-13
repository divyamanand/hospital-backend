import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { StaffService } from './staff.service';

//all done
@Controller('staff')
export class StaffController {
  constructor(private svc: StaffService) {}
  @Get()
  list() { return this.svc.findAll(); }
  @Get(':id')
  get(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post()
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Get(':id/timings')
  getTimings(@Param('id') id: string) { return this.svc.getTimings(id); }

  @Post(':id/timings')
  upsertTimings(@Param('id') id: string, @Body() body: any[]) { return this.svc.upsertTimings(id, body); }
  
  // Timings CRUD
  @Post(':id/timings/single')
  createTiming(@Param('id') id: string, @Body() body: any) { return this.svc.createTiming(id, body); }
  @Get(':id/timings/:timingId')
  getTiming(@Param('id') id: string, @Param('timingId') timingId: string) { return this.svc.getTimingById(id, timingId); }
  @Put(':id/timings/:timingId')
  updateTiming(@Param('id') id: string, @Param('timingId') timingId: string, @Body() body: any) { return this.svc.updateTiming(id, timingId, body); }
  @Delete(':id/timings/:timingId')
  deleteTiming(@Param('id') id: string, @Param('timingId') timingId: string) { return this.svc.deleteTiming(id, timingId); }
  
  // Leaves CRUD
  @Get(':id/leaves')
  listLeaves(@Param('id') id: string) { return this.svc.listLeaves(id); }
  @Post(':id/leaves')
  addLeave(@Param('id') id: string, @Body() body: any) { return this.svc.addLeave(id, body); }
  @Get(':id/leaves/:leaveId')
  getLeave(@Param('id') id: string, @Param('leaveId') leaveId: string) { return this.svc.getLeaveById(id, leaveId); }
  @Put(':id/leaves/:leaveId')
  updateLeave(@Param('id') id: string, @Param('leaveId') leaveId: string, @Body() body: any) { return this.svc.updateLeave(id, leaveId, body); }
  @Delete(':id/leaves/:leaveId')
  deleteLeave(@Param('id') id: string, @Param('leaveId') leaveId: string) { return this.svc.deleteLeave(id, leaveId); }
}
