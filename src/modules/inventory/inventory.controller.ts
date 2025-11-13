import { Body, Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Get('inventory')
  list() { return this.svc.listItems(); }
  @Get('inventory/type/:type')
  listByType(@Param('type') type: string) { return this.svc.listByType(type as any); }

  @Post('inventory')
  create(@Body() body: any) { return this.svc.createItem(body); }

  @Put('inventory/:id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.updateItem(id, body); }
  @Delete('inventory/:id')
  remove(@Param('id') id: string) { return this.svc.deleteItem(id); }

  @Get('inventory/by-name/:name')
  getByName(@Param('name') name: string) { return this.svc.getItemByName(name); }

  @Post('inventory/:id/adjust')
  adjust(@Param('id') id: string, @Body() body: { change: number; reason: string; referenceId?: string }) { return this.svc.adjustItem(id, body); }

  @Post('inventory/:id/add')
  addStock(@Param('id') id: string, @Body() body: { quantity: number; referenceId?: string }) { return this.svc.addStock(id, body?.quantity, body?.referenceId); }

  @Post('inventory/:id/dispense')
  dispense(@Param('id') id: string, @Body() body: { quantity: number; referenceId?: string }) { return this.svc.dispenseItem(id, body?.quantity, body?.referenceId); }

  @Delete('inventory/remove-expired')
  removeExpired() { return this.svc.removeExpired(); }

  @Post('prescription/:id/fulfill')
  fulfillPrescription(@Param('id') id: string) { return this.svc.fulfillPrescription(id); }
}
