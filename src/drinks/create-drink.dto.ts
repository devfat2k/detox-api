import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateDrinkDto {
  @IsNotEmpty()
  @IsString()
  slug!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  category_id!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsArray()
  @IsString({ each: true })
  ingredients!: string[];

  @IsNotEmpty()
  @IsString()
  benefit!: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  level?: number;

  @IsOptional()
  @IsBoolean()
  is_detox_core?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  target_goals?: string[];

  @IsOptional()
  @IsUrl()
  image_url?: string;
}
