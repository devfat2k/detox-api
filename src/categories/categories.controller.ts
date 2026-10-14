import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './create-category.dto.js';
import { UpdateCategoryDto } from './update-category.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả danh mục thực đơn',
    description: 'Trả về các nhóm sản phẩm (Sinh tố xanh, Nước ép tươi, Sữa hạt & Trà)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các danh mục',
  })
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Lấy chi tiết danh mục theo slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug của danh mục',
    example: 'sinh-to-xanh',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết danh mục',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy danh mục với slug tương ứng',
  })
  async findBySlug(@Param('slug') slug: string) {
    return await this.categoriesService.findBySlug(slug);
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo mới một danh mục',
  })
  @ApiResponse({
    status: 201,
    description: 'Danh mục được tạo thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật danh mục theo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của danh mục cần cập nhật',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh mục được cập nhật thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy danh mục',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa danh mục theo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của danh mục cần xóa',
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa danh mục thành công',
  })
  async remove(@Param('id') id: string) {
    return await this.categoriesService.remove(id);
  }
}
