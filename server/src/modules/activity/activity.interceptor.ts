import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityService } from './activity.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(private readonly activitySvc: ActivityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as any;
    const ip = req.ip || req.headers?.['x-forwarded-for'] || null;
    const action = `${req.method} ${req.originalUrl || req.url}`;
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        try {
          this.activitySvc.log(user?.id ?? null, action, ip ?? null, { duration });
        } catch (e) {
          // swallow logging errors
        }
      }),
    );
  }
}
