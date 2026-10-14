// Khung sườn DTO cập nhật Thức uống

import { CreateDrinkDto } from './create-drink.dto';
import { PartialType } from '@nestjs/mapped-types';

// Bạn sẽ kế thừa từ CreateDrinkDto sử dụng PartialType tại đây theo hướng dẫn
export class UpdateDrinkDto extends PartialType(CreateDrinkDto) {}
