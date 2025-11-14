import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards, Req, ForbiddenException, Query } from '@nestjs/common';
import { RequirementService } from './requirement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('requirements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequirementController {
  constructor(private readonly svc: RequirementService) {}

  // New: Item Requirements
  @Post('items')
  @Roles('admin','receptionist','doctor','nurse','lab_tech','pharmacist','inventory','room_manager')
  async createItemReq(@Body() body: { kind:'equipment'|'blood'; quantity:number; notes?:string }, @Req() req: any) {
    const primaryUserId = await this.svc.resolvePrimaryUserId(req.user || {});
    if (!primaryUserId) throw new ForbiddenException('Cannot resolve user');
    return this.svc.createItemRequirement({ primaryUserId, kind: body.kind, quantity: body.quantity, notes: body.notes ?? null, status: 'pending' });
  }
  @Get('items')
  @Roles('admin','receptionist','pharmacist','inventory','doctor','nurse','lab_tech','room_manager')
  async listItemReq(@Req() req: any, @Query() q: any) {
    const role = req.user?.role;
    const filter: any = {};
    if (q.status) filter.status = q.status;
    if (q.primaryUserId) filter.primaryUserId = q.primaryUserId;
    if (q.createdFrom) filter.createdFrom = q.createdFrom;
    if (q.createdTo) filter.createdTo = q.createdTo;
    if (['pharmacist','inventory','admin','receptionist'].includes(role)) return this.svc.listItemRequirements(filter);
    const primaryUserId = await this.svc.resolvePrimaryUserId(req.user || {});
    if (!primaryUserId) return [];
    return this.svc.listItemRequirements({ ...filter, primaryUserId });
  }
  @Get('items/:id')
  @Roles('admin','receptionist','pharmacist','inventory','doctor','nurse','lab_tech','room_manager')
  async getItemReq(@Param('id') id: string, @Req() req: any) {
    const rec = await this.svc.getItemRequirement(id);
    if (!rec) return rec;
    const role = req.user?.role;
    if (['admin','receptionist','pharmacist','inventory'].includes(role)) return rec;
    const primaryUserId = await this.svc.resolvePrimaryUserId(req.user || {});
    if (rec.primaryUserId !== primaryUserId) throw new ForbiddenException('Not allowed');
    return rec;
  }
  @Put('items/:id')
  @Roles('admin','receptionist')
  updateItemReq(@Param('id') id: string, @Body() body: Partial<{ quantity:number; status:string; notes:string }>) {
    return this.svc.updateItemRequirement(id, body as any);
  }
  @Delete('items/:id')
  @Roles('admin','receptionist')
  deleteItemReq(@Param('id') id: string) { return this.svc.deleteItemRequirement(id); }

  // New: Staff Requirements
  @Post('staff')
  @Roles('admin','receptionist','doctor','nurse','lab_tech','pharmacist','inventory','room_manager')
  async createStaffReq(@Body() body: { roleNeeded:string; quantity:number; notes?:string }, @Req() req: any) {
    const primaryUserId = await this.svc.resolvePrimaryUserId(req.user || {});
    if (!primaryUserId) throw new ForbiddenException('Cannot resolve user');
    return this.svc.createStaffRequirement({ primaryUserId, roleNeeded: body.roleNeeded, quantity: body.quantity, notes: body.notes ?? null, status: 'pending' });
  }
  @Get('staff')
  @Roles('admin','receptionist','doctor','nurse','lab_tech','inventory','room_manager')
  async listStaffReq(@Req() req: any, @Query() q: any) {
    const role = req.user?.role;
    const filter: any = {};
    if (q.status) filter.status = q.status;
    if (q.primaryUserId) filter.primaryUserId = q.primaryUserId;
    if (q.createdFrom) filter.createdFrom = q.createdFrom;
    if (q.createdTo) filter.createdTo = q.createdTo;
    if (['admin','receptionist'].includes(role)) return this.svc.listStaffRequirements(filter);
    const primaryUserId = await this.svc.resolvePrimaryUserId(req.user || {});
    if (!primaryUserId) return [];
    return this.svc.listStaffRequirements({ ...filter, primaryUserId });
  }
  @Get('staff/:id')
  @Roles('admin','receptionist','doctor','nurse','lab_tech','inventory','room_manager')
  async getStaffReq(@Param('id') id: string, @Req() req: any) {
    const rec = await this.svc.getStaffRequirement(id);
    if (!rec) return rec;
    const role = req.user?.role;
    if (['admin','receptionist'].includes(role)) return rec;
    const primaryUserId = await this.svc.resolvePrimaryUserId(req.user || {});
    if (rec.primaryUserId !== primaryUserId) throw new ForbiddenException('Not allowed');
    return rec;
  }
  @Put('staff/:id')
  @Roles('admin','receptionist')
  updateStaffReq(@Param('id') id: string, @Body() body: Partial<{ roleNeeded:string; quantity:number; status:string; notes:string }>) {
    return this.svc.updateStaffRequirement(id, body as any);
  }
  @Delete('staff/:id')
  @Roles('admin','receptionist')
  deleteStaffReq(@Param('id') id: string) { return this.svc.deleteStaffRequirement(id); }

  // New: Room Requirements
  @Post('rooms')
  @Roles('admin','receptionist','doctor','nurse','lab_tech','pharmacist','inventory','room_manager')
  async createRoomReq(@Body() body: { roomType:string; quantity:number; notes?:string }, @Req() req: any) {
    const primaryUserId = await this.svc.resolvePrimaryUserId(req.user || {});
    if (!primaryUserId) throw new ForbiddenException('Cannot resolve user');
    return this.svc.createRoomRequirement({ primaryUserId, roomType: body.roomType, quantity: body.quantity, notes: body.notes ?? null, status: 'pending' });
  }
  @Get('rooms')
  @Roles('admin','receptionist','room_manager','doctor','nurse','lab_tech','inventory')
  async listRoomReq(@Req() req: any, @Query() q: any) {
    const role = req.user?.role;
    const filter: any = {};
    if (q.status) filter.status = q.status;
    if (q.primaryUserId) filter.primaryUserId = q.primaryUserId;
    if (q.createdFrom) filter.createdFrom = q.createdFrom;
    if (q.createdTo) filter.createdTo = q.createdTo;
    if (['admin','receptionist','room_manager'].includes(role)) return this.svc.listRoomRequirements(filter);
    const primaryUserId = await this.svc.resolvePrimaryUserId(req.user || {});
    if (!primaryUserId) return [];
    return this.svc.listRoomRequirements({ ...filter, primaryUserId });
  }
  @Get('rooms/:id')
  @Roles('admin','receptionist','room_manager','doctor','nurse','lab_tech','inventory')
  async getRoomReq(@Param('id') id: string, @Req() req: any) {
    const rec = await this.svc.getRoomRequirement(id);
    if (!rec) return rec;
    const role = req.user?.role;
    if (['admin','receptionist','room_manager'].includes(role)) return rec;
    const primaryUserId = await this.svc.resolvePrimaryUserId(req.user || {});
    if (rec.primaryUserId !== primaryUserId) throw new ForbiddenException('Not allowed');
    return rec;
  }
  @Put('rooms/:id')
  @Roles('admin','receptionist')
  updateRoomReq(@Param('id') id: string, @Body() body: Partial<{ roomType:string; quantity:number; status:string; notes:string }>) {
    return this.svc.updateRoomRequirement(id, body as any);
  }
  @Delete('rooms/:id')
  @Roles('admin','receptionist')
  deleteRoomReq(@Param('id') id: string) { return this.svc.deleteRoomRequirement(id); }
}
