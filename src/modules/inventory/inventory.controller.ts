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
  @Roles('admin','pharmacist','inventory')
  list() { return this.svc.listItems(); }
  @Get('inventory/type/:type')
  @Roles('admin','pharmacist','inventory')
  listByType(@Param('type') type: string) { return this.svc.listByType(type as any); }

  @Post('inventory')
  @Roles('admin','pharmacist','inventory')
  create(@Body() body: any) { return this.svc.createItem(body); }

  @Put('inventory/:id')
  @Roles('admin','pharmacist','inventory')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.updateItem(id, body); }
  @Delete('inventory/:id')
  @Roles('admin','pharmacist','inventory')
  remove(@Param('id') id: string) { return this.svc.deleteItem(id); }

  @Get('inventory/by-name/:name')
  @Roles('admin','pharmacist','inventory')
  getByName(@Param('name') name: string) { return this.svc.getItemByName(name); }

  @Post('inventory/:id/adjust')
  @Roles('admin','pharmacist','inventory')
  adjust(@Param('id') id: string, @Body() body: { change: number; reason: string; referenceId?: string }) { return this.svc.adjustItem(id, body); }

  @Post('inventory/:id/add')
  @Roles('admin','pharmacist','inventory')
  addStock(@Param('id') id: string, @Body() body: { quantity: number; referenceId?: string }) { return this.svc.addStock(id, body?.quantity, body?.referenceId); }

  @Post('inventory/:id/dispense')
  @Roles('admin','pharmacist','inventory')
  dispense(@Param('id') id: string, @Body() body: { quantity: number; referenceId?: string }) { return this.svc.dispenseItem(id, body?.quantity, body?.referenceId); }

  @Delete('inventory/remove-expired')
  @Roles('admin','pharmacist','inventory')
  removeExpired() { return this.svc.removeExpired(); }

  @Post('prescription/:id/fulfill')
  @Roles('admin','pharmacist','inventory')
  fulfillPrescription(@Param('id') id: string) { return this.svc.fulfillPrescription(id); }
}
