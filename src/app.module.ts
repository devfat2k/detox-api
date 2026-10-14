import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { DrinksModule } from './drinks/drinks.module';
import { ConsultationModule } from './consultation/consultation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    DrinksModule,
    ConsultationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

