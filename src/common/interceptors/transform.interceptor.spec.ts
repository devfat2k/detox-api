import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor.js';
import { ApiResponse } from '../interfaces/api-response.interface.js';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<unknown>;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new TransformInterceptor(reflector);
  });

  it('should wrap successful controller response into standard envelope', async () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ url: '/api/test' }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of({ id: '1', name: 'Detox 1' }),
    };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const result$ = interceptor.intercept(mockContext, mockCallHandler);
    const result = (await lastValueFrom(result$)) as ApiResponse<unknown>;

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.message).toBe('Thao tác thành công');
    expect(result.data).toEqual({ id: '1', name: 'Detox 1' });
    expect(result.path).toBe('/api/test');
    expect(result.timestamp).toBeDefined();
  });

  it('should extract custom message from controller response', async () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ url: '/api/drinks/123' }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of({ message: 'Xóa thành công' }),
    };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const result$ = interceptor.intercept(mockContext, mockCallHandler);
    const result = (await lastValueFrom(result$)) as ApiResponse<unknown>;

    expect(result.success).toBe(true);
    expect(result.message).toBe('Xóa thành công');
    expect(result.data).toBeNull();
  });

  it('should bypass transformation when @BypassTransform is active', async () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
    } as unknown as ExecutionContext;

    const rawData = 'raw data';
    const mockCallHandler: CallHandler = {
      handle: () => of(rawData),
    };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const result$ = interceptor.intercept(mockContext, mockCallHandler);
    const result = await lastValueFrom(result$);

    expect(result).toBe(rawData);
  });
});
