import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Get('inventory')
  list() { return this.svc.listItems(); }

  @Post('inventory')
  create(@Body() body: any) { return this.svc.createItem(body); }

  @Put('inventory/:id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.updateItem(id, body); }

  @Post('inventory/:id/adjust')
  adjust(@Param('id') id: string, @Body() body: { change: number; reason: string; referenceId?: string }) { return this.svc.adjustItem(id, body); }

  @Post('prescription/:id/fulfill')
  fulfillPrescription(@Param('id') id: string) { return this.svc.fulfillPrescription(id); }
}
