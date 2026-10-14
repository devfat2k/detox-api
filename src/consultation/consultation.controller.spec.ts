/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationController } from './consultation.controller.js';
import {
  type ConsultationResult,
  ConsultationService,
} from './consultation.service.js';
import { HealthGoal, SubmitConsultationDto } from './consultation.dto.js';

describe('ConsultationController', () => {
  let controller: ConsultationController;

  const mockConsultationResult: ConsultationResult = {
    nickname: 'Lan',
    assessment: {
      bmi: 20,
      category: 'Thể trạng cân đối',
      recommendationNote: 'Duy trì lối sống lành mạnh',
    },
    warnings: [],
    guidance: ['Thanh lọc cơ thể'],
    durationDays: 1,
    dailySchedule: [],
    disclaimer: 'Thông tin tham khảo',
  };

  const mockConsultationService = {
    generateConsultation: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConsultationService.generateConsultation.mockResolvedValue(
      mockConsultationResult,
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsultationController],
      providers: [
        {
          provide: ConsultationService,
          useValue: mockConsultationService,
        },
      ],
    }).compile();

    controller = module.get<ConsultationController>(ConsultationController);
  });

  it('nên được khởi tạo thành công', () => {
    expect(controller).toBeDefined();
  });

  describe('generateConsultation', () => {
    it('nên gọi service và trả về kết quả tư vấn', async () => {
      const dto: SubmitConsultationDto = {
        goal: HealthGoal.DETOX,
      };

      const result = await controller.generateConsultation(dto);
      expect(result).toEqual(mockConsultationResult);
      expect(mockConsultationService.generateConsultation).toHaveBeenCalledWith(
        dto,
      );
    });
  });
});
