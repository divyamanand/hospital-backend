import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: any = context.switchToHttp().getRequest();
    const start = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(`${req.method} ${req.url} ${req.statusCode ?? ''} +${ms}ms`);
        },
        error: () => {
          const ms = Date.now() - start;
          this.logger.error(`${req.method} ${req.url} ERROR +${ms}ms`);
        },
      }),
    );
  }
}
