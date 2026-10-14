import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlansService } from './plans.service';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách các gói lộ trình tiêu chuẩn',
    description:
      'Trả về danh sách tất cả các gói detox chuẩn (Gói 1 ngày, 3 ngày, 6 ngày)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các gói lộ trình detox',
  })
  async findAll() {
    return await this.plansService.findAll();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Lấy chi tiết một gói lộ trình theo slug',
    description:
      'Truy vấn thông tin gói lộ trình dựa trên slug (ví dụ: goi-khoi-dong-1-ngay, goi-can-bang-3-ngay, goi-chuyen-sau-6-ngay)',
  })
  @ApiParam({
    name: 'slug',
    description: 'Định danh duy nhất dạng slug của gói lộ trình',
    example: 'goi-can-bang-3-ngay',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết gói lộ trình',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy gói lộ trình tương ứng với slug',
  })
  async findBySlug(@Param('slug') slug: string) {
    return await this.plansService.findBySlug(slug);
  }
}
