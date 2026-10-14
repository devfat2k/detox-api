import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';
import { SupabaseModule } from '../supabase/supabase.module.js';

@Module({
  imports: [TerminusModule, SupabaseModule],
  controllers: [HealthController],
})
export class HealthModule {}
