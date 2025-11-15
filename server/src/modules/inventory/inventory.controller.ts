import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards, Query } from '@nestjs/common';
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
  list(@Query() q: any) {
    const filter: any = {};
    if (q.type) filter.type = q.type;
    if (q.lowStock) filter.lowStock = parseInt(q.lowStock,10);
    if (q.expiryBefore) filter.expiryBefore = q.expiryBefore;
    if (q.expiry) filter.expiryBefore = q.expiry; // alias
    return this.svc.listItems(filter).then(rows => rows.map(r => ({
      name: r.name,
      quantity: r.quantity,
      unit: r.unit,
      expiry: (r as any).expiry || null,
    })));
  }
  @Get('inventory/type/:type')
  @Roles('admin','pharmacist','inventory')
  listByType(@Param('type') type: string) { 
    return this.svc.listItems({ type }).then(rows => rows.map(r => ({
      name: r.name,
      quantity: r.quantity,
      unit: r.unit,
      expiry: (r as any).expiry || null,
    })));
  }

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
  adjust(@Param('id') id: string, @Body() body: { change: number; reason?: string; referenceId?: string }) {
    return this.svc.adjustItem(id, { quantity: body.change, reason: body.reason, refPrescriptionItemId: body.referenceId });
  }

  @Post('inventory/:id/add')
  @Roles('admin','pharmacist','inventory')
  addStock(@Param('id') id: string, @Body() body: { quantity: number; referenceId?: string; unit?: string | null; expiry?: string | null }) {
    return this.svc.addStock(id, body?.quantity, body?.referenceId, body?.unit ?? null, body?.expiry ?? null);
  }

  @Post('inventory/:id/dispense')
  @Roles('admin','pharmacist','inventory')
  dispense(@Param('id') id: string, @Body() body: { quantity: number; referenceId?: string }) { return this.svc.dispenseItem(id, body?.quantity, body?.referenceId); }

  @Delete('inventory/remove-expired')
  @Roles('admin','pharmacist','inventory')
  removeExpired() { return this.svc.removeExpired(); }

  @Post('prescription/:id/fulfill')
  @Roles('admin','pharmacist','inventory')
  fulfillPrescription(@Param('id') id: string) { return this.svc.fulfillPrescription(id); }

  @Get('inventory/transactions')
  @Roles('admin','pharmacist','inventory')
  listTransactions(@Query() q: any) {
    const filter: any = {};
    if (q.itemId) filter.itemId = q.itemId;
    if (q.type) filter.type = q.type;
    if (q.from) filter.from = q.from;
    if (q.to) filter.to = q.to;
    return this.svc.listTransactions(filter);
  }
}
