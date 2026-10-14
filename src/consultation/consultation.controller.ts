import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubmitConsultationDto } from './consultation.dto';
import {
  type ConsultationResult,
  ConsultationService,
} from './consultation.service';

@ApiTags('Consultation')
@Controller('consultation')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Khảo sát thể trạng và sinh lộ trình detox cá nhân hóa',
    description:
      'Quy trình sàng lọc 4 giai đoạn: Sàng lọc thể trạng cơ sở (BMI chuẩn Châu Á), Định hình mục tiêu sức khỏe, Xác định kinh nghiệm & khẩu vị, Thẩm định an toàn rủi ro y tế để sinh lộ trình 5 cữ tỷ lệ vàng 3:1:1',
  })
  @ApiResponse({
    status: 200,
    description:
      'Kết quả tư vấn bao gồm BMI, khuyến cáo y tế, gói đề xuất và thực đơn 5 cữ xoay vòng mỗi ngày',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ theo DTO Validation',
  })
  async generateConsultation(
    @Body() dto: SubmitConsultationDto,
  ): Promise<ConsultationResult> {
    return await this.consultationService.generateConsultation(dto);
  }
}
