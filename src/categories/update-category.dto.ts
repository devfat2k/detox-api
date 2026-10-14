// Khung sườn DTO cập nhật Danh mục

import { CreateCategoryDto } from './create-category.dto';
import { PartialType } from '@nestjs/mapped-types';
// Bạn sẽ kế thừa từ CreateCategoryDto sử dụng PartialType tại đây theo hướng dẫn
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
