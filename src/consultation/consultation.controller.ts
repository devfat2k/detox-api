import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SubmitConsultationDto } from './consultation.dto';
import {
  type ConsultationResult,
  ConsultationService,
} from './consultation.service';

@Controller('consultation')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async generateConsultation(
    @Body() dto: SubmitConsultationDto,
  ): Promise<ConsultationResult> {
    return await this.consultationService.generateConsultation(dto);
  }
}
