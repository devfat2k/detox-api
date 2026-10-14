import { PartialType } from '@nestjs/swagger';
import { CreateDrinkDto } from './create-drink.dto.js';

export class UpdateDrinkDto extends PartialType(CreateDrinkDto) {}
