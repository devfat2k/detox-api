import { Test, TestingModule } from '@nestjs/testing';
import {
  ActivityLevel,
  ExperienceLevel,
  HealthGoal,
  SubmitConsultationDto,
} from './consultation.dto';
import { ConsultationService } from './consultation.service';

describe('ConsultationService', () => {
  let service: ConsultationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsultationService],
    }).compile();

    service = module.get<ConsultationService>(ConsultationService);
  });

  it('nên được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  describe('generateConsultation', () => {
    it('nên tính toán BMI và trả về lộ trình 1 ngày với 5 cữ uống chuẩn 3:1:1', () => {
      const dto: SubmitConsultationDto = {
        baseline: {
          nickname: 'Lan',
          age: 28,
          weightKg: 50,
          heightCm: 160,
          activityLevel: ActivityLevel.LIGHT,
        },
        goal: HealthGoal.DETOX,
        preferences: {
          experienceLevel: ExperienceLevel.BEGINNER,
          canDrinkBitterOrEarthy: false,
          durationDays: 1,
        },
        risks: {
          hasStomachPain: false,
          isPregnantOrNursing: false,
          hasDiabetes: false,
          allergies: [],
        },
      };

      const result = service.generateConsultation(dto);

      expect(result.nickname).toBe('Lan');
      expect(result.assessment.bmi).toBe(19.5);
      expect(result.assessment.category).toBe('Thể trạng cân đối');
      expect(result.warnings).toHaveLength(0);
      expect(result.dailySchedule).toHaveLength(1);
      expect(result.dailySchedule[0].meals).toHaveLength(5);
      expect(result.dailySchedule[0].meals[0].category).toBe('SMOOTHIE');
      expect(result.dailySchedule[0].meals[1].category).toBe('JUICE');
      expect(result.dailySchedule[0].meals[2].category).toBe('SMOOTHIE');
      expect(result.dailySchedule[0].meals[3].category).toBe('SMOOTHIE');
      expect(result.dailySchedule[0].meals[4].category).toBe('NUT_MILK_TEA');
    });

    it('nên cảnh báo chính xác khi có các rủi ro sức khỏe', () => {
      const dto: SubmitConsultationDto = {
        baseline: {
          nickname: '',
          age: 35,
          weightKg: 75,
          heightCm: 160,
          activityLevel: ActivityLevel.SEDENTARY,
        },
        goal: HealthGoal.WEIGHT_LOSS,
        preferences: {
          experienceLevel: ExperienceLevel.EXPERIENCED,
          canDrinkBitterOrEarthy: true,
          durationDays: 3,
        },
        risks: {
          hasStomachPain: true,
          isPregnantOrNursing: true,
          hasDiabetes: true,
          allergies: ['Dứa', 'Cần tây'],
        },
      };

      const result = service.generateConsultation(dto);

      expect(result.nickname).toBe('Bạn');
      expect(result.assessment.bmi).toBe(29.3);
      expect(result.assessment.category).toBe('Thừa cân / Béo phì');
      expect(result.warnings.length).toBeGreaterThanOrEqual(4);
      expect(result.warnings.some((w) => w.includes('mang thai'))).toBe(true);
      expect(result.warnings.some((w) => w.includes('tiêu hóa'))).toBe(true);
      expect(result.warnings.some((w) => w.includes('đường huyết'))).toBe(true);
      expect(result.warnings.some((w) => w.includes('Dứa, Cần tây'))).toBe(true);
      expect(result.dailySchedule).toHaveLength(3);
    });

    it('nên tạo đủ 6 ngày cho gói 6 ngày', () => {
      const dto: SubmitConsultationDto = {
        baseline: {
          age: 25,
          weightKg: 45,
          heightCm: 165,
          activityLevel: ActivityLevel.MODERATE,
        },
        goal: HealthGoal.BEAUTY_SKIN,
        preferences: {
          durationDays: 6,
        },
        risks: {},
      };

      const result = service.generateConsultation(dto);

      expect(result.assessment.category).toBe('Thiếu cân');
      expect(result.durationDays).toBe(6);
      expect(result.dailySchedule).toHaveLength(6);
      result.dailySchedule.forEach((day, index) => {
        expect(day.day).toBe(index + 1);
        expect(day.meals).toHaveLength(5);
      });
    });
  });
});
