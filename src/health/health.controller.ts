import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { SupabaseService } from '../supabase/supabase.service';
import { BypassTransform } from '../common/decorators/bypass-transform.decorator';

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
