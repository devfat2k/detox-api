import { Controller, Get, Param } from '@nestjs/common';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  async findAll() {
    return await this.plansService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return await this.plansService.findBySlug(slug);
  }
}
