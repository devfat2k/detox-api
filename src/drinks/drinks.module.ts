import { Module } from '@nestjs/common';
import { DrinksController } from './drinks.controller.js';
import { DrinksService } from './drinks.service.js';

@Module({
  imports: [],
  controllers: [DrinksController],
  providers: [DrinksService],
  exports: [DrinksService],
})
export class DrinksModule {}
