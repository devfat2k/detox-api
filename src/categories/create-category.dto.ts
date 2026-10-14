import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Tên danh mục thực đơn',
    example: 'Sinh tố xanh',
  })
  @IsString({ message: 'Tên danh mục phải là một chuỗi' })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name!: string;

  @ApiProperty({
    description: 'Mã định danh slug duy nhất',
    example: 'sinh-to-xanh',
  })
  @IsString({ message: 'Mã danh mục phải là một chuỗi' })
  @IsNotEmpty({ message: 'Mã danh mục không được để trống' })
  slug!: string;

  @ApiPropertyOptional({
    description: 'Mô tả vai trò dinh dưỡng của danh mục',
    example: 'Đậm đặc diệp lục và chất xơ hòa tan, êm dạ dày và no lâu',
  })
  @IsString({ message: 'Mô tả danh mục phải là một chuỗi' })
  @IsOptional()
  description?: string;
}
