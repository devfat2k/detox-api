import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateDrinkDto } from './create-drink.dto';
import { DrinksService } from './drinks.service';
import { FilterDrinkDto } from './filter-drink.dto';
import { UpdateDrinkDto } from './update-drink.dto';

@Controller('drinks')
export class DrinksController {
  constructor(private readonly drinksService: DrinksService) {}

  @Get()
  async findAll(@Query() filter: FilterDrinkDto) {
    return await this.drinksService.findAll(filter);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return await this.drinksService.findBySlug(slug);
  }

  @Post()
  async create(@Body() createDrinkDto: CreateDrinkDto) {
    return await this.drinksService.create(createDrinkDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDrinkDto: UpdateDrinkDto,
  ) {
    return await this.drinksService.update(id, updateDrinkDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.drinksService.remove(id);
  }
}
