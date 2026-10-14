// Khung sườn DTO tạo Danh mục

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Bạn sẽ định nghĩa các trường dữ liệu và decorator validation tại đây theo hướng dẫn
export class CreateCategoryDto {
  @IsString({ message: 'Tên danh mục phải là một chuỗi' })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name!: string;

  @IsString({ message: 'Mã danh mục phải là một chuỗi' })
  @IsNotEmpty({ message: 'Mã danh mục không được để trống' })
  slug!: string;

  @IsString({ message: 'Mô tả danh mục phải là một chuỗi' })
  @IsOptional()
  description?: string;
}
