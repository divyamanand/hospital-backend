import { Controller, Get, Post, Param, Body, Put, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

//all done
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private svc: StaffService) {}
  @Get()
  @Roles('admin')
  list() { return this.svc.findAll(); }
  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || sub === id) return this.svc.findOne(id);
    throw new ForbiddenException('Not allowed');
  }
  @Post()
  @Roles('admin','receptionist')
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || sub === id) return this.svc.update(id, body);
    throw new ForbiddenException('Not allowed');
  }

  @Get(':id/timings')
  getTimings(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || sub === id) return this.svc.getTimings(id);
    throw new ForbiddenException('Not allowed');
  }

  @Post(':id/timings')
  upsertTimings(@Param('id') id: string, @Body() body: any[], @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || sub === id) return this.svc.upsertTimings(id, body);
    throw new ForbiddenException('Not allowed');
  }
  
  // Timings CRUD
  @Post(':id/timings/single')
  createTiming(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || sub === id) return this.svc.createTiming(id, body);
    throw new ForbiddenException('Not allowed');
  }
  @Get(':id/timings/:timingId')
  getTiming(@Param('id') id: string, @Param('timingId') timingId: string, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || sub === id) return this.svc.getTimingById(id, timingId);
    throw new ForbiddenException('Not allowed');
  }
  @Put(':id/timings/:timingId')
  updateTiming(@Param('id') id: string, @Param('timingId') timingId: string, @Body() body: any, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || sub === id) return this.svc.updateTiming(id, timingId, body);
    throw new ForbiddenException('Not allowed');
  }
  @Delete(':id/timings/:timingId')
  deleteTiming(@Param('id') id: string, @Param('timingId') timingId: string, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || sub === id) return this.svc.deleteTiming(id, timingId);
    throw new ForbiddenException('Not allowed');
  }
  
  // Leaves CRUD
  @Get(':id/leaves')
  listLeaves(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || sub === id) return this.svc.listLeaves(id);
    throw new ForbiddenException('Not allowed');
  }
  @Post(':id/leaves')
  addLeave(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || sub === id) return this.svc.addLeave(id, body);
    throw new ForbiddenException('Not allowed');
  }
  @Get(':id/leaves/:leaveId')
  getLeave(@Param('id') id: string, @Param('leaveId') leaveId: string, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || sub === id) return this.svc.getLeaveById(id, leaveId);
    throw new ForbiddenException('Not allowed');
  }
  @Put(':id/leaves/:leaveId')
  updateLeave(@Param('id') id: string, @Param('leaveId') leaveId: string, @Body() body: any, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || sub === id) return this.svc.updateLeave(id, leaveId, body);
    throw new ForbiddenException('Not allowed');
  }
  @Delete(':id/leaves/:leaveId')
  deleteLeave(@Param('id') id: string, @Param('leaveId') leaveId: string, @Req() req: any) {
    const role = req.user?.role; const sub = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || sub === id) return this.svc.deleteLeave(id, leaveId);
    throw new ForbiddenException('Not allowed');
  }
}
