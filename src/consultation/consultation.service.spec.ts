import { Test, TestingModule } from '@nestjs/testing';
import {
  ActivityLevel,
  ExperienceLevel,
  HealthGoal,
  SubmitConsultationDto,
} from './consultation.dto.js';
import { ConsultationService } from './consultation.service.js';
import { DrinksService } from '../drinks/drinks.service.js';
import { PlansService } from '../plans/plans.service.js';

describe('ConsultationService', () => {
  let service: ConsultationService;

  // Dữ liệu thức uống giả lập từ database
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

  const mockPlans = [
    {
      id: 'plan-1',
      name: 'Gói Khởi Động 1 Ngày',
      slug: 'goi-khoi-dong-1-ngay',
      duration_days: 1,
      total_bottles: 5,
    },
    {
      id: 'plan-2',
      name: 'Gói Cân Bằng 3 Ngày',
      slug: 'goi-can-bang-3-ngay',
      duration_days: 3,
      total_bottles: 15,
    },
    {
      id: 'plan-3',
      name: 'Gói Chuyên Sâu 6 Ngày',
      slug: 'goi-chuyen-sau-6-ngay',
      duration_days: 6,
      total_bottles: 30,
    },
  ];

  const mockDrinksService = {
    findAll: jest.fn().mockResolvedValue(mockDrinks),
  };

  const mockPlansService = {
    findAll: jest.fn().mockResolvedValue(mockPlans),
    findBySlug: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDrinksService.findAll.mockResolvedValue(mockDrinks);
    mockPlansService.findAll.mockResolvedValue(mockPlans);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationService,
        {
          provide: DrinksService,
          useValue: mockDrinksService,
        },
        {
          provide: PlansService,
          useValue: mockPlansService,
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
      expect(result.recommendedPlan?.duration_days).toBe(1);
      expect(result.dailySchedule).toHaveLength(1);
      expect(result.dailySchedule[0].meals).toHaveLength(5);
      expect(result.dailySchedule[0].meals[0].category).toBe('SMOOTHIE');
      expect(result.dailySchedule[0].meals[1].category).toBe('JUICE');
      expect(result.dailySchedule[0].meals[2].category).toBe('SMOOTHIE');
      expect(result.dailySchedule[0].meals[3].category).toBe('SMOOTHIE');
      expect(result.dailySchedule[0].meals[4].category).toBe('NUT_MILK_TEA');
      expect(mockDrinksService.findAll).toHaveBeenCalledTimes(1);
      expect(mockPlansService.findAll).toHaveBeenCalledTimes(1);
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
      expect(result.recommendedPlan?.duration_days).toBe(6);
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

      result.dailySchedule.forEach((day) => {
        day.meals.forEach((meal) => {
          meal.suggestedItems.forEach((item) => {
            expect(item).not.toContain('Cần Tây');
          });
        });
      });
    });

    describe('Quy tắc đề xuất gói (determineRecommendedPlan)', () => {
      it('nên đề xuất gói 1 ngày an toàn khi có rủi ro mang thai hoặc đau dạ dày', async () => {
        const dto: SubmitConsultationDto = {
          baseline: { age: 26, weightKg: 52, heightCm: 162, activityLevel: ActivityLevel.LIGHT },
          goal: HealthGoal.DETOX,
          preferences: { experienceLevel: ExperienceLevel.BEGINNER },
          risks: { hasStomachPain: true },
        };

        const result = await service.generateConsultation(dto);

        expect(result.recommendedPlan?.duration_days).toBe(1);
        expect(result.recommendedPlan?.reason).toContain('an toàn nhất');
        expect(result.durationDays).toBe(1);
      });

      it('nên đề xuất gói 3 ngày cân bằng cho người mới bắt đầu', async () => {
        const dto: SubmitConsultationDto = {
          baseline: { age: 25, weightKg: 50, heightCm: 160, activityLevel: ActivityLevel.LIGHT },
          goal: HealthGoal.DETOX,
          preferences: { experienceLevel: ExperienceLevel.BEGINNER },
          risks: { hasStomachPain: false, isPregnantOrNursing: false },
        };

        const result = await service.generateConsultation(dto);

        expect(result.recommendedPlan?.duration_days).toBe(3);
        expect(result.recommendedPlan?.reason).toContain('3 ngày cân bằng');
        expect(result.durationDays).toBe(3);
      });

      it('nên đề xuất gói 1 ngày nhẹ nhàng khi thể trạng thiếu cân', async () => {
        const dto: SubmitConsultationDto = {
          baseline: { age: 22, weightKg: 40, heightCm: 160, activityLevel: ActivityLevel.LIGHT }, // BMI = 15.6 < 18.5
          goal: HealthGoal.BEAUTY_SKIN,
          preferences: { experienceLevel: ExperienceLevel.EXPERIENCED },
          risks: {},
        };

        const result = await service.generateConsultation(dto);

        expect(result.assessment.bmi).toBeLessThan(18.5);
        expect(result.recommendedPlan?.duration_days).toBe(1);
        expect(result.recommendedPlan?.reason).toContain('thiếu cân');
      });

      it('nên đề xuất gói 6 ngày chuyên sâu khi người có kinh nghiệm, mục tiêu giảm cân và thừa cân', async () => {
        const dto: SubmitConsultationDto = {
          baseline: { age: 30, weightKg: 70, heightCm: 160, activityLevel: ActivityLevel.MODERATE }, // BMI = 27.3 > 22.9
          goal: HealthGoal.WEIGHT_LOSS,
          preferences: { experienceLevel: ExperienceLevel.EXPERIENCED },
          risks: { hasStomachPain: false, isPregnantOrNursing: false },
        };

        const result = await service.generateConsultation(dto);

        expect(result.recommendedPlan?.duration_days).toBe(6);
        expect(result.recommendedPlan?.reason).toContain('6 ngày chuyên sâu');
        expect(result.durationDays).toBe(6);
      });

      it('nên tôn trọng lựa chọn durationDays chủ động của người dùng', async () => {
        const dto: SubmitConsultationDto = {
          baseline: { age: 30, weightKg: 70, heightCm: 160, activityLevel: ActivityLevel.MODERATE },
          goal: HealthGoal.WEIGHT_LOSS,
          preferences: {
            experienceLevel: ExperienceLevel.EXPERIENCED,
            durationDays: 1, // Chủ động chọn gói 1 ngày dù đủ điều kiện 6 ngày
          },
          risks: {},
        };

        const result = await service.generateConsultation(dto);

        expect(result.recommendedPlan?.duration_days).toBe(1);
        expect(result.recommendedPlan?.reason).toContain('1 ngày bạn mong muốn');
        expect(result.durationDays).toBe(1);
      });
    });

    describe('Tối ưu phân loại danh mục và ưu tiên mục tiêu', () => {
      it('nên nhận diện đúng cữ uống qua category slug khi name không theo chuẩn', async () => {
        const drinksWithSlugOnly = [
          {
            id: 's1',
            name: 'Green Smoothie Special',
            is_detox_core: false,
            categories: { id: 'c1', name: 'Custom Name', slug: 'sinh-to-xanh' },
            ingredients: ['Kale'],
            target_goals: ['DETOX'],
            level: 30,
          },
          {
            id: 'j1',
            name: 'Orange Juice Special',
            is_detox_core: false,
            categories: { id: 'c2', name: 'Custom Juice', slug: 'nuoc-ep-tuoi' },
            ingredients: ['Orange'],
            target_goals: ['BEAUTY_SKIN'],
            level: 20,
          },
          {
            id: 'm1',
            name: 'Almond Milk Special',
            is_detox_core: false,
            categories: { id: 'c3', name: 'Custom Milk', slug: 'sua-hat-tra' },
            ingredients: ['Almond'],
            target_goals: ['DIGESTION'],
            level: 10,
          },
        ];

        mockDrinksService.findAll.mockResolvedValueOnce(drinksWithSlugOnly);

        const dto: SubmitConsultationDto = {
          goal: HealthGoal.DETOX,
          preferences: { durationDays: 1 },
        };

        const result = await service.generateConsultation(dto);
        const day1Meals = result.dailySchedule[0].meals;

        expect(day1Meals[0].suggestedItems[0]).toBe('Green Smoothie Special');
        expect(day1Meals[1].suggestedItems[0]).toBe('Orange Juice Special');
        expect(day1Meals[4].suggestedItems[0]).toBe('Almond Milk Special');
      });

      it('nên ưu tiên gợi ý thức uống khớp với mục tiêu sức khỏe (target_goals)', async () => {
        const multipleSmoothies = [
          {
            id: 's-detox',
            name: 'Sinh tố Thuần Detox',
            is_detox_core: true,
            categories: { id: 'c1', name: 'Sinh tố xanh', slug: 'sinh-to-xanh' },
            target_goals: ['DETOX'],
            level: 20,
          },
          {
            id: 's-weight',
            name: 'Sinh tố Giảm Cân Đốt Mỡ',
            is_detox_core: true,
            categories: { id: 'c1', name: 'Sinh tố xanh', slug: 'sinh-to-xanh' },
            target_goals: ['WEIGHT_LOSS'],
            level: 20,
          },
        ];

        mockDrinksService.findAll.mockResolvedValueOnce(multipleSmoothies);

        const dto: SubmitConsultationDto = {
          goal: HealthGoal.WEIGHT_LOSS,
          preferences: { durationDays: 1 },
        };

        const result = await service.generateConsultation(dto);
        // Slot 1 (Bữa sáng) với day=1, slot=1 -> (1+1)%2 = 0 -> phần tử đầu tiên
        // Vì ưu tiên WEIGHT_LOSS nên món 'Sinh tố Giảm Cân Đốt Mỡ' phải đứng đầu mảng
        expect(result.dailySchedule[0].meals[0].suggestedItems[0]).toBe(
          'Sinh tố Giảm Cân Đốt Mỡ',
        );
      });
    });
  });
});
