import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BYPASS_TRANSFORM_KEY } from '../decorators/bypass-transform.decorator';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    const isBypassed = this.reflector.getAllAndOverride<boolean>(
      BYPASS_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isBypassed) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<{ url: string }>();
    const res = http.getResponse<{ statusCode: number }>();

    return next.handle().pipe(
      map((responseBody: unknown) => {
        let message = 'Thao tác thành công';
        let data = responseBody as T;

        if (
          responseBody &&
          typeof responseBody === 'object' &&
          !Array.isArray(responseBody) &&
          'message' in responseBody
        ) {
          const { message: customMsg, ...rest } = responseBody as {
            message: string;
            [key: string]: unknown;
          };
          message = customMsg;
          data = (Object.keys(rest).length > 0 ? rest : null) as T;
        }

        return {
          success: true,
          statusCode: res.statusCode,
          message,
          data,
          timestamp: new Date().toISOString(),
          path: req.url,
        };
      }),
    );
  }
}
