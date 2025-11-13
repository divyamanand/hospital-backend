import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Get('inventory')
  @Roles('admin','pharmacist')
  list() { return this.svc.listItems(); }
  @Get('inventory/type/:type')
  @Roles('admin','pharmacist')
  listByType(@Param('type') type: string) { return this.svc.listByType(type as any); }

  @Post('inventory')
  @Roles('admin','pharmacist')
  create(@Body() body: any) { return this.svc.createItem(body); }

  @Put('inventory/:id')
  @Roles('admin','pharmacist')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.updateItem(id, body); }
  @Delete('inventory/:id')
  @Roles('admin','pharmacist')
  remove(@Param('id') id: string) { return this.svc.deleteItem(id); }

  @Get('inventory/by-name/:name')
  @Roles('admin','pharmacist')
  getByName(@Param('name') name: string) { return this.svc.getItemByName(name); }

  @Post('inventory/:id/adjust')
  @Roles('admin','pharmacist')
  adjust(@Param('id') id: string, @Body() body: { change: number; reason: string; referenceId?: string }) { return this.svc.adjustItem(id, body); }

  @Post('inventory/:id/add')
  @Roles('admin','pharmacist')
  addStock(@Param('id') id: string, @Body() body: { quantity: number; referenceId?: string }) { return this.svc.addStock(id, body?.quantity, body?.referenceId); }

  @Post('inventory/:id/dispense')
  @Roles('admin','pharmacist')
  dispense(@Param('id') id: string, @Body() body: { quantity: number; referenceId?: string }) { return this.svc.dispenseItem(id, body?.quantity, body?.referenceId); }

  @Delete('inventory/remove-expired')
  @Roles('admin','pharmacist')
  removeExpired() { return this.svc.removeExpired(); }

  @Post('prescription/:id/fulfill')
  @Roles('admin','pharmacist')
  fulfillPrescription(@Param('id') id: string) { return this.svc.fulfillPrescription(id); }
}
