import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') ?? '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const { statusCode } = res;
          this.logger.log(
            `${method} ${originalUrl} ${statusCode} - ${duration}ms [${ip}] ${userAgent}`,
          );
        },
        error: (err: Error) => {
          const duration = Date.now() - startTime;
          this.logger.warn(
            `${method} ${originalUrl} FAILED - ${duration}ms [${ip}]: ${err.message}`,
          );
        },
      }),
    );
  }
}
