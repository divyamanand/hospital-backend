import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RequirementService } from './requirement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequirementController {
  constructor(private readonly svc: RequirementService) {}

  // Item requirements
  @Get('requirements/items')
  @Roles('admin')
  listItemRequirements() { return this.svc.listItemRequirements(); }

  @Post('requirements/items')
  @Roles('admin')
  createItemRequirement(@Body() body: any) { return this.svc.createItemRequirement(body); }

  @Get('requirements/items/:id')
  @Roles('admin')
  getItemRequirement(@Param('id') id: string) { return this.svc.getItemRequirement(id); }

  @Patch('requirements/items/:id')
  @Roles('admin')
  updateItemRequirement(@Param('id') id: string, @Body() body: any) { return this.svc.updateItemRequirement(id, body); }

  @Get('requirements/items/:id/fulfillments')
  @Roles('admin')
  listItemFulfillments(@Param('id') id: string) { return this.svc.listItemFulfillments(id); }

  @Post('requirements/items/:id/fulfillments')
  @Roles('admin')
  createItemFulfillment(@Param('id') id: string, @Body() body: any) { return this.svc.createItemFulfillment(id, body); }

  @Patch('requirements/items/fulfillments/:fid')
  @Roles('admin')
  updateItemFulfillment(@Param('fid') fid: string, @Body() body: any) { return this.svc.updateItemFulfillment(fid, body); }

  // Staff requirements
  @Get('requirements/staff')
  @Roles('admin')
  listStaffRequirements() { return this.svc.listStaffRequirements(); }

  @Post('requirements/staff')
  @Roles('admin')
  createStaffRequirement(@Body() body: any) { return this.svc.createStaffRequirement(body); }

  @Get('requirements/staff/:id')
  @Roles('admin')
  getStaffRequirement(@Param('id') id: string) { return this.svc.getStaffRequirement(id); }

  @Patch('requirements/staff/:id')
  @Roles('admin')
  updateStaffRequirement(@Param('id') id: string, @Body() body: any) { return this.svc.updateStaffRequirement(id, body); }

  @Get('requirements/staff/:id/fulfillments')
  @Roles('admin')
  listStaffFulfillments(@Param('id') id: string) { return this.svc.listStaffFulfillments(id); }

  @Post('requirements/staff/:id/fulfillments')
  @Roles('admin')
  createStaffFulfillment(@Param('id') id: string, @Body() body: any) { return this.svc.createStaffFulfillment(id, body); }

  @Patch('requirements/staff/fulfillments/:fid')
  @Roles('admin')
  updateStaffFulfillment(@Param('fid') fid: string, @Body() body: any) { return this.svc.updateStaffFulfillment(fid, body); }

  // Room requirements
  @Get('requirements/rooms')
  @Roles('admin')
  listRoomRequirements() { return this.svc.listRoomRequirements(); }

  @Post('requirements/rooms')
  @Roles('admin')
  createRoomRequirement(@Body() body: any) { return this.svc.createRoomRequirement(body); }

  @Get('requirements/rooms/:id')
  @Roles('admin')
  getRoomRequirement(@Param('id') id: string) { return this.svc.getRoomRequirement(id); }

  @Patch('requirements/rooms/:id')
  @Roles('admin')
  updateRoomRequirement(@Param('id') id: string, @Body() body: any) { return this.svc.updateRoomRequirement(id, body); }

  @Get('requirements/rooms/:id/fulfillments')
  @Roles('admin')
  listRoomFulfillments(@Param('id') id: string) { return this.svc.listRoomFulfillments(id); }

  @Post('requirements/rooms/:id/fulfillments')
  @Roles('admin')
  createRoomFulfillment(@Param('id') id: string, @Body() body: any) { return this.svc.createRoomFulfillment(id, body); }

  @Patch('requirements/rooms/fulfillments/:fid')
  @Roles('admin')
  updateRoomFulfillment(@Param('fid') fid: string, @Body() body: any) { return this.svc.updateRoomFulfillment(fid, body); }
}
