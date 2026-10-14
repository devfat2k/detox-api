import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDrinkDto } from './create-drink.dto';
import { DrinksService } from './drinks.service';
import { FilterDrinkDto } from './filter-drink.dto';
import { UpdateDrinkDto } from './update-drink.dto';

@ApiTags('Drinks')
@Controller('drinks')
export class DrinksController {
  constructor(private readonly drinksService: DrinksService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách thức uống có hỗ trợ lọc',
    description:
      'Lấy danh sách các món nước ép/sinh tố/sữa hạt, có thể lọc theo category_id, target_goal hoặc is_detox_core',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách thức uống thỏa mãn bộ lọc',
  })
  async findAll(@Query() filter: FilterDrinkDto) {
    return await this.drinksService.findAll(filter);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Lấy chi tiết thức uống theo slug',
    description: 'Truy vấn chi tiết một món thức uống theo slug duy nhất',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug định danh của món',
    example: 'sinh-to-kale-chuoi-chia',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết thức uống',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thức uống với slug tương ứng',
  })
  async findBySlug(@Param('slug') slug: string) {
    return await this.drinksService.findBySlug(slug);
  }

  @Post()
  @ApiOperation({
    summary: 'Thêm mới thức uống vào thực đơn',
  })
  @ApiResponse({
    status: 201,
    description: 'Thức uống đã được tạo thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
  })
  async create(@Body() createDrinkDto: CreateDrinkDto) {
    return await this.drinksService.create(createDrinkDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin thức uống theo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của thức uống cần cập nhật',
  })
  @ApiResponse({
    status: 200,
    description: 'Thức uống đã được cập nhật thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thức uống',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDrinkDto: UpdateDrinkDto,
  ) {
    return await this.drinksService.update(id, updateDrinkDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa thức uống khỏi thực đơn',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của thức uống cần xóa',
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa thức uống thành công',
  })
  async remove(@Param('id') id: string) {
    return await this.drinksService.remove(id);
  }
}
