import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [TerminusModule, SupabaseModule],
  controllers: [HealthController],
})
export class HealthModule {}
