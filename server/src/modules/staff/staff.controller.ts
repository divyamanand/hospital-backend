import { Controller, Get, Post, Param, Body, Put, Delete, UseGuards, Req, ForbiddenException, Query } from '@nestjs/common';
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
  @Roles('admin','receptionist')
  list(@Req() req: any, @Query() q: any) {
    const role = req.user?.role;
    const filter: any = {};
    if (q?.role) filter.role = q.role;
    if (q?.specialtyId) filter.specialtyId = q.specialtyId;
    if (q?.isAvailable) filter.isAvailable = q.isAvailable === 'true';
    if (q?.onLeave) filter.onLeave = q.onLeave === 'true';
    return this.svc.findAllDetailed(filter).then(rows => {
      if (role === 'receptionist') return rows.filter(r => r.role !== 'admin');
      return rows;
    });
  }
  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role; const userStaffId = req.user?.staffId; // assuming mapped
    if (role === 'admin') return this.svc.findOneDetailed(id);
    if (role === 'receptionist') {
      return this.svc.findOneDetailed(id).then(s => { if (!s || s.role === 'admin') throw new ForbiddenException('Not allowed'); return s; });
    }
    if (['doctor','inventory','pharmacist','room_manager'].includes(role) && userStaffId === id) return this.svc.findOneDetailed(id);
    throw new ForbiddenException('Not allowed');
  }
  @Post()
  @Roles('admin','receptionist')
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const role = req.user?.role; const userStaffId = req.user?.staffId;
    if (role === 'admin') return this.svc.update(id, body);
    if (role === 'receptionist') return this.svc.update(id, body); // service layer should reject admin edits
    if (['doctor','inventory','pharmacist','room_manager'].includes(role) && userStaffId === id) {
      const limited: any = {};
      if (body.phone) limited.phone = body.phone;
      if (body.notes) limited.notes = body.notes;
      return this.svc.update(id, limited);
    }
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
