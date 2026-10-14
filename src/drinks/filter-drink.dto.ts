import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FilterDrinkDto {
  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsString()
  target_goal?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  is_detox_core?: boolean;
}
