import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Định danh slug duy nhất của món',
    example: 'sinh-to-kale-chuoi-chia',
  })
  @IsNotEmpty()
  @IsString()
  slug!: string;

  @ApiProperty({
    description: 'Tên món thức uống',
    example: 'Sinh Tố Kale Chuối Hạt Chia',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'UUID của danh mục',
    example: 'c1000000-0000-0000-0000-000000000001',
  })
  @IsNotEmpty()
  @IsString()
  category_id!: string;

  @ApiProperty({
    description: 'Giá bán (VNĐ)',
    example: 45000,
  })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiProperty({
    description: 'Danh sách các nguyên liệu thành phần',
    example: ['cải kale', 'chuối', 'hạt chia', 'sữa hạnh nhân'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  ingredients!: string[];

  @ApiProperty({
    description: 'Lợi ích sức khỏe và vai trò dinh dưỡng',
    example: 'Giàu chất xơ thô, no lâu êm bụng, duy trì năng lượng buổi sáng',
  })
  @IsNotEmpty()
  @IsString()
  benefit!: string;

  @ApiPropertyOptional({
    description: 'Mã màu nhận diện giao diện',
    example: '#2E7D32',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Thang đo độ đậm/vị đắng hăng (0 - 100)',
    example: 40,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  level?: number;

  @ApiPropertyOptional({
    description: 'Có phải món trọng tâm thải độc (Detox core) không',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_detox_core?: boolean;

  @ApiPropertyOptional({
    description: 'Các mục tiêu sức khỏe phù hợp',
    example: ['DETOX', 'WEIGHT_LOSS'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  target_goals?: string[];

  @ApiPropertyOptional({
    description: 'Đường dẫn ảnh đại diện sản phẩm',
    example: 'https://res.cloudinary.com/.../kale-smoothie.jpg',
  })
  @IsOptional()
  @IsUrl()
  image_url?: string;
}
