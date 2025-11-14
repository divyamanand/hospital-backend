import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly svc: UserService) {}

  @Get()
  @Roles('admin','receptionist')
  list(@Query() q: any) {
    const filter: any = {};
    if (q.role) filter.role = q.role;
    if (q.type) filter.type = q.type;
    if (q.emailLike) filter.emailLike = q.emailLike;
    if (q.gender) filter.gender = q.gender;
    if (q.minAge) filter.minAge = parseInt(q.minAge,10);
    if (q.maxAge) filter.maxAge = parseInt(q.maxAge,10);
    return this.svc.findAll(filter);
  }

  @Get(':id')
  @Roles('admin','receptionist','doctor','patient')
  get(@Param('id') id: string, @Req() req: any) {
    const role = req.user?.role; const userId = req.user?.id;
    if (role === 'admin' || role === 'receptionist') return this.svc.findOne(id);
    if (userId === id) return this.svc.findOne(id);
    throw new ForbiddenException();
  }

  @Post()
  @Roles('admin','receptionist')
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  @Roles('admin','receptionist','doctor','patient')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const role = req.user?.role; const userId = req.user?.id;
    if (role === 'admin' || role === 'receptionist' || userId === id) return this.svc.update(id, body);
    throw new ForbiddenException();
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
