import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;
    const req: any = context.switchToHttp().getRequest();
    const role: AppRole | undefined = req.user?.role;
    if (!role) throw new ForbiddenException('No role');
    if (!roles.includes(role)) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
