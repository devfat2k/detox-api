import { Test, TestingModule } from '@nestjs/testing';
import {
  ActivityLevel,
  ExperienceLevel,
  HealthGoal,
  SubmitConsultationDto,
} from './consultation.dto';
import { ConsultationService } from './consultation.service';
import { DrinksService } from '../drinks/drinks.service';

describe('ConsultationService', () => {
  let service: ConsultationService;

  // Dữ liệu thức uống giả lập từ database (Supabase join trả về "categories" không phải "category")
  const mockDrinks = [
    {
      id: '1',
      name: 'Sinh tố Cải Kale Chuối',
      is_detox_core: true,
      categories: { id: 'c1', name: 'Sinh tố xanh' },
      ingredients: ['Cải kale', 'Chuối', 'Hạt chia'],
      target_goals: ['DETOX', 'WEIGHT_LOSS'],
      level: 80,
    },
    {
      id: '2',
      name: 'Nước ép Cần Tây Táo Xanh',
      is_detox_core: false,
      categories: { id: 'c2', name: 'Nước ép tươi' },
      ingredients: ['Cần tây', 'Táo xanh', 'Dưa leo'],
      target_goals: ['DETOX'],
      level: 50,
    },
    {
      id: '3',
      name: 'Sữa Hạt Điều Hạnh Nhân',
      is_detox_core: false,
      categories: { id: 'c3', name: 'Sữa hạt dinh dưỡng' },
      ingredients: ['Hạt điều', 'Hạnh nhân'],
      target_goals: ['BEAUTY_SKIN'],
      level: 20,
    },
  ];

  const mockDrinksService = {
    findAll: jest.fn().mockResolvedValue(mockDrinks),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDrinksService.findAll.mockResolvedValue(mockDrinks);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationService,
        {
          provide: DrinksService,
          useValue: mockDrinksService,
        },
      ],
    }).compile();

    service = module.get<ConsultationService>(ConsultationService);
  });

  it('nên được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  describe('generateConsultation', () => {
    it('nên tính toán BMI và trả về lộ trình 1 ngày với 5 cữ uống chuẩn 3:1:1', async () => {
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

      const result = await service.generateConsultation(dto);

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
      expect(mockDrinksService.findAll).toHaveBeenCalledTimes(1);
    });

    it('nên cảnh báo chính xác khi có các rủi ro sức khỏe', async () => {
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

      const result = await service.generateConsultation(dto);

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

    it('nên tạo đủ 6 ngày cho gói 6 ngày', async () => {
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

      const result = await service.generateConsultation(dto);

      expect(result.assessment.category).toBe('Thiếu cân');
      expect(result.durationDays).toBe(6);
      expect(result.dailySchedule).toHaveLength(6);
      result.dailySchedule.forEach((day, index) => {
        expect(day.day).toBe(index + 1);
        expect(day.meals).toHaveLength(5);
      });
    });

    it('nên loại trừ các món chứa thành phần gây dị ứng', async () => {
      const dto: SubmitConsultationDto = {
        goal: HealthGoal.DETOX,
        risks: {
          allergies: ['Cần tây'],
        },
      };

      const result = await service.generateConsultation(dto);

      // Kiểm tra tất cả gợi ý trong ngày không món nào chứa 'Cần Tây'
      result.dailySchedule.forEach((day) => {
        day.meals.forEach((meal) => {
          meal.suggestedItems.forEach((item) => {
            expect(item).not.toContain('Cần Tây');
          });
        });
      });
    });
  });
});
