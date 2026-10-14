import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseService } from '../supabase/supabase.service.js';
import { BypassTransform } from '../common/decorators/bypass-transform.decorator.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  @HealthCheck()
  @BypassTransform()
  @ApiOperation({
    summary: 'Kiểm tra trạng thái hệ thống',
    description:
      'Kiểm tra tình trạng bộ nhớ RAM (Heap < 200MB) và kết nối tới database Supabase',
  })
  @ApiResponse({
    status: 200,
    description: 'Hệ thống hoạt động bình thường',
  })
  @ApiResponse({
    status: 503,
    description: 'Có dịch vụ gặp sự cố (RAM vượt ngưỡng hoặc mất kết nối DB)',
  })
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),

      async () => {
        const { error } = await this.supabaseService
          .getClient()
          .from('categories')
          .select('id')
          .limit(1);

        if (error) {
          return {
            supabase: {
              status: 'down',
              message: error.message,
            },
          };
        }

        return {
          supabase: {
            status: 'up',
          },
        };
      },
    ]);
  }
}
