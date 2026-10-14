import { Injectable } from '@nestjs/common';
import {
  ActivityLevel,
  ExperienceLevel,
  HealthGoal,
  HealthRisksDto,
  SubmitConsultationDto,
} from './consultation.dto';
import { DrinksService } from '../drinks/drinks.service';
import {
  BITTER_LEVEL_THRESHOLD,
  BMI_THRESHOLDS,
  CATEGORY_NAMES,
  DAILY_MEAL_SLOTS,
  DEFAULT_BASELINE,
  DISCLAIMER_TEXT,
  MENU_STRINGS,
  MealSlotCategory,
} from './consultation.constants';
import { PlansService } from '../plans/plans.service';

// -- Interfaces --
export interface RecommendedPlan {
  id: string;
  name: string;
  slug: string;
  duration_days: number;
  total_bottles: number;
  reason: string;
}

export interface Drink {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  price: number;
  ingredients: string[];
  benefit: string;
  color?: string;
  level?: number;
  is_detox_core?: boolean;
  target_goals?: string[];
  image_url?: string;
  // Supabase join: .select('*, categories(id, name)')
  categories?: { id: string; name: string } | null;
}

export interface BmiAssessment {
  bmi: number;
  category: string;
  recommendationNote: string;
}

export interface MealSlot {
  slot: number;
  time: string;
  name: string;
  category: 'SMOOTHIE' | 'JUICE' | 'NUT_MILK_TEA';
  role: string;
  suggestedItems: string[];
}

export interface DayPlan {
  day: number;
  title: string;
  meals: MealSlot[];
}

export interface ConsultationResult {
  nickname: string;
  assessment: BmiAssessment;
  warnings: string[];
  guidance: string[];
  durationDays: number;
  recommendedPlan: RecommendedPlan | null;
  dailySchedule: DayPlan[];
  disclaimer: string;
}

@Injectable()
export class ConsultationService {
  constructor(
    private readonly drinksService: DrinksService,
    private readonly plansService: PlansService,
  ) {}

  async generateConsultation(
    dto: SubmitConsultationDto,
  ): Promise<ConsultationResult> {
    const { baseline, goal, preferences, risks } = dto;
    const [allDrinks, allPlans] = await Promise.all([
      this.drinksService.findAll() as Promise<Drink[]>,
      this.plansService.findAll(),
    ]);

    const nickname =
      baseline?.nickname?.trim() || DEFAULT_BASELINE.DEFAULT_NAME;
    const weight = baseline?.weightKg ?? DEFAULT_BASELINE.WEIGHT_KG;
    const height = baseline?.heightCm ?? DEFAULT_BASELINE.HEIGHT_CM;
    const assessment = this.calculateBmi(weight, height);

    const warnings = this.evaluateRisks(risks);
    const guidance = this.buildGuidance(goal, baseline?.activityLevel);
    const recommendedPlan = this.determineRecommendedPlan(
      dto,
      assessment,
      allPlans,
    );
    const durationDays =
      recommendedPlan?.duration_days ??
      preferences?.durationDays ??
      DEFAULT_BASELINE.DURATION_DAYS;
    const dailySchedule = this.generateMenu(durationDays, allDrinks, dto);

    return {
      nickname,
      assessment,
      warnings,
      guidance,
      durationDays,
      recommendedPlan,
      dailySchedule,
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  private determineRecommendedPlan(
    dto: SubmitConsultationDto,
    assessment: BmiAssessment,
    plans: any[],
  ): RecommendedPlan | null {
    if (!plans || plans.length === 0) return null;

    const findByDays = (days: number) =>
      plans.find((p) => p.duration_days === days) || plans[0];

    const { preferences, risks, goal } = dto;

    // 1. Nếu người dùng đã chủ động chọn số ngày
    if (preferences?.durationDays) {
      const selected = findByDays(preferences.durationDays);
      return {
        id: selected.id,
        name: selected.name,
        slug: selected.slug,
        duration_days: selected.duration_days,
        total_bottles: selected.total_bottles,
        reason: `Gói được chọn theo thời lượng ${preferences.durationDays} ngày bạn mong muốn.`,
      };
    }

    // 2. Rào chắn an toàn y tế
    if (risks?.isPregnantOrNursing || risks?.hasStomachPain) {
      const plan1 = findByDays(1);
      return {
        id: plan1.id,
        name: plan1.name,
        slug: plan1.slug,
        duration_days: plan1.duration_days,
        total_bottles: plan1.total_bottles,
        reason:
          'Thể trạng hoặc hệ tiêu hóa cần lưu ý đặc biệt. Gói 1 ngày khởi động nhẹ nhàng là lựa chọn an toàn nhất.',
      };
    }

    // 3. Người mới hoặc thể trạng thiếu cân
    const isBeginner =
      preferences?.experienceLevel === ExperienceLevel.BEGINNER;
    const isUnderweight = assessment.bmi < BMI_THRESHOLDS.UNDERWEIGHT;

    if (isBeginner || isUnderweight) {
      const targetDays = isUnderweight ? 1 : 3;
      const plan = findByDays(targetDays);
      return {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        duration_days: plan.duration_days,
        total_bottles: plan.total_bottles,
        reason: isUnderweight
          ? 'Thể trạng thiếu cân, khuyến nghị trải nghiệm gói 1 ngày để bổ sung dinh dưỡng nhẹ nhàng.'
          : 'Bạn mới làm quen với detox, lộ trình 3 ngày cân bằng giúp cơ thể thích nghi êm ái mà không bị quá tải.',
      };
    }

    // 4. Đã có kinh nghiệm + Mục tiêu giảm cân + Thừa cân
    const isOverweight = assessment.bmi > BMI_THRESHOLDS.NORMAL_MAX;
    if (
      preferences?.experienceLevel === ExperienceLevel.EXPERIENCED &&
      goal === HealthGoal.WEIGHT_LOSS &&
      isOverweight
    ) {
      const plan6 = findByDays(6);
      return {
        id: plan6.id,
        name: plan6.name,
        slug: plan6.slug,
        duration_days: plan6.duration_days,
        total_bottles: plan6.total_bottles,
        reason:
          'Bạn đã quen với nước ép xanh và có mục tiêu vóc dáng rõ rệt, gói 6 ngày chuyên sâu sẽ tối ưu chuyển hóa mỡ thừa tích tụ.',
      };
    }

    // 5. Mặc định: Gói 3 ngày cân bằng tiêu chuẩn
    const defaultPlan = findByDays(3);
    return {
      id: defaultPlan.id,
      name: defaultPlan.name,
      slug: defaultPlan.slug,
      duration_days: defaultPlan.duration_days,
      total_bottles: defaultPlan.total_bottles,
      reason:
        'Lộ trình 3 ngày là nhịp độ cân bằng tiêu chuẩn, giúp thanh lọc đường ruột và tái tạo năng lượng hiệu quả.',
    };
  }

  private calculateBmi(weightKg: number, heightCm: number): BmiAssessment {
    const heightM = heightCm / 100;
    const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

    let category = 'Thể trạng cân đối';
    let recommendationNote =
      'Duy trì chế độ dinh dưỡng cân bằng và kết hợp detox nhẹ nhàng.';

    if (bmi < BMI_THRESHOLDS.UNDERWEIGHT) {
      category = 'Thiếu cân';
      recommendationNote =
        'Nên ưu tiên sinh tố giàu dinh dưỡng, sữa hạt và không nhịn ăn hoàn toàn.';
    } else if (
      bmi > BMI_THRESHOLDS.NORMAL_MAX &&
      bmi <= BMI_THRESHOLDS.OVERWEIGHT_MAX
    ) {
      category = 'Tiền béo phì (Thừa cân nhẹ)';
      recommendationNote =
        'Phù hợp với lộ trình cắt giảm calo rỗng và tăng cường chất xơ từ rau lá xanh.';
    } else if (bmi > BMI_THRESHOLDS.OVERWEIGHT_MAX) {
      category = 'Thừa cân / Béo phì';
      recommendationNote =
        'Nên kết hợp liệu trình thanh lọc với vận động vừa sức, ưu tiên rau lá đậm diệp lục.';
    }

    return { bmi, category, recommendationNote };
  }

  private evaluateRisks(risks?: HealthRisksDto): string[] {
    const warnings: string[] = [];
    if (!risks) return warnings;

    if (risks.isPregnantOrNursing) {
      warnings.push(
        'Lưu ý y khoa: Không áp dụng liệu trình nhịn ăn hoàn toàn khi mang thai hoặc cho con bú. Hãy dùng sản phẩm như bữa phụ bổ sung dinh dưỡng.',
      );
    }

    if (risks.hasStomachPain) {
      warnings.push(
        'Lưu ý tiêu hóa: Hạn chế các loại nước ép trái cây có vị chua gắt (cam, dứa) lúc đói. Ưu tiên sinh tố xanh làm dịu niêm mạc.',
      );
    }

    if (risks.hasDiabetes) {
      warnings.push(
        'Lưu ý đường huyết: Hạn chế trái cây ngọt và củ dền. Ưu tiên nước ép cần tây, dưa leo và rau lá xanh đậm ít calo.',
      );
    }

    if (risks.allergies && risks.allergies.length > 0) {
      warnings.push(
        `Lưu ý dị ứng: Cần loại trừ các thành phần gây dị ứng (${risks.allergies.join(', ')}) khi chế biến.`,
      );
    }

    return warnings;
  }

  private buildGuidance(goal?: HealthGoal, activity?: ActivityLevel): string[] {
    const guidance: string[] = [];

    switch (goal) {
      case HealthGoal.WEIGHT_LOSS:
        guidance.push(
          'Mục tiêu vóc dáng: Tập trung giảm gánh nặng calo, tăng cường rau xanh tạo cảm giác no tự nhiên.',
        );
        break;
      case HealthGoal.BEAUTY_SKIN:
        guidance.push(
          'Mục tiêu làn da: Tăng cường vitamin C tự nhiên, chất chống oxy hóa và chất béo lành từ hạt.',
        );
        break;
      case HealthGoal.DIGESTION:
        guidance.push(
          'Mục tiêu tiêu hóa: Tối ưu chất xơ hòa tan từ rau củ để nuôi dưỡng hệ vi sinh đường ruột.',
        );
        break;
      case HealthGoal.DETOX:
      default:
        guidance.push(
          'Mục tiêu thanh lọc: Giải phóng năng lượng tồn dư, giúp cơ thể nhẹ nhõm sau kỳ ăn uống dầu mỡ.',
        );
        break;
    }

    if (activity === ActivityLevel.VERY_ACTIVE) {
      guidance.push(
        'Vận động nhiều: Có thể bổ sung thêm một nắm hạt dinh dưỡng nguyên vị nếu thấy đói.',
      );
    }

    return guidance;
  }

  private generateMenu(
    days: number,
    allDrinks: Drink[],
    dto: SubmitConsultationDto,
  ): DayPlan[] {
    const allergies = dto.risks?.allergies ?? [];
    const bitterOk = dto.preferences?.canDrinkBitterOrEarthy ?? false;

    // 1. Lọc bỏ các món chứa chất gây dị ứng
    const allergyFreeDrinks = allDrinks.filter((drink) => {
      if (!drink.ingredients || drink.ingredients.length === 0) return true;
      const hasAllergy = drink.ingredients.some((ing) =>
        allergies.some((allergy) =>
          ing.toLowerCase().includes(allergy.toLowerCase()),
        ),
      );
      return !hasAllergy;
    });

    // 2. Lọc theo khẩu vị — nếu không uống được vị hăng/đắng, loại drink level cao
    const safeDrinks = bitterOk
      ? allergyFreeDrinks
      : allergyFreeDrinks.filter(
          (d) => (d.level ?? 0) < BITTER_LEVEL_THRESHOLD,
        );

    // 3. Phân loại món theo nhóm cữ uống (dùng categories.name từ Supabase join)
    const categoryName = (d: Drink) => d.categories?.name ?? '';

    const smoothies = safeDrinks.filter(
      (d) =>
        d.is_detox_core === true ||
        categoryName(d).includes(CATEGORY_NAMES.SMOOTHIE),
    );
    const juices = safeDrinks.filter(
      (d) => !d.is_detox_core && categoryName(d).includes(CATEGORY_NAMES.JUICE),
    );
    const nutMilks = safeDrinks.filter(
      (d) =>
        categoryName(d).includes(CATEGORY_NAMES.NUT_MILK) ||
        categoryName(d).includes(CATEGORY_NAMES.TEA),
    );

    // 4. Khởi tạo lịch trình theo số ngày (xoay vòng món)
    const schedule: DayPlan[] = [];

    for (let day = 1; day <= days; day++) {
      schedule.push({
        day,
        title: MENU_STRINGS.DAY_TITLE(day),
        meals: DAILY_MEAL_SLOTS.map((slot) => {
          let candidatePool: Drink[] = [];
          if (slot.category === MealSlotCategory.SMOOTHIE)
            candidatePool = smoothies;
          else if (slot.category === MealSlotCategory.JUICE)
            candidatePool = juices;
          else candidatePool = nutMilks;

          // Nếu database chưa có đủ món theo nhóm, dùng fallback an toàn từ toàn bộ safeDrinks
          if (candidatePool.length === 0) candidatePool = safeDrinks;

          // Chọn món xoay vòng theo ngày và cữ
          const selectedDrink =
            candidatePool.length > 0
              ? candidatePool[(day + slot.slot) % candidatePool.length]
              : null;

          return {
            ...slot,
            suggestedItems: selectedDrink
              ? [selectedDrink.name]
              : [MENU_STRINGS.FALLBACK_DRINK],
          };
        }),
      });
    }

    return schedule;
  }
}
