import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FilterDrinkDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ID danh mục (UUID)',
    example: 'c1000000-0000-0000-0000-000000000001',
  })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo mục tiêu sức khỏe (DETOX, WEIGHT_LOSS, BEAUTY_SKIN, DIGESTION)',
    example: 'WEIGHT_LOSS',
  })
  @IsOptional()
  @IsString()
  target_goal?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo món cốt lõi thải độc (Sinh tố xanh)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  is_detox_core?: boolean;
}
