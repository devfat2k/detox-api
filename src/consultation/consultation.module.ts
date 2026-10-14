import { Module } from '@nestjs/common';
import { ConsultationController } from './consultation.controller.js';
import { ConsultationService } from './consultation.service.js';
import { DrinksModule } from '../drinks/drinks.module.js';
import { PlansModule } from '../plans/plans.module.js';

@Module({
  imports: [DrinksModule, PlansModule],
  controllers: [ConsultationController],
  providers: [ConsultationService],
  exports: [ConsultationService],
})
export class ConsultationModule {}
