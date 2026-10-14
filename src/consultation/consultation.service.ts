import { Injectable } from '@nestjs/common';
import {
  ActivityLevel,
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

// -- Interfaces --

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
  dailySchedule: DayPlan[];
  disclaimer: string;
}

@Injectable()
export class ConsultationService {
  constructor(private readonly drinksService: DrinksService) {}

  async generateConsultation(
    dto: SubmitConsultationDto,
  ): Promise<ConsultationResult> {
    const { baseline, goal, preferences, risks } = dto;
    const allDrinks = (await this.drinksService.findAll()) as Drink[];

    const nickname =
      baseline?.nickname?.trim() || DEFAULT_BASELINE.DEFAULT_NAME;
    const weight = baseline?.weightKg ?? DEFAULT_BASELINE.WEIGHT_KG;
    const height = baseline?.heightCm ?? DEFAULT_BASELINE.HEIGHT_CM;
    const assessment = this.calculateBmi(weight, height);

    // TODO: baseline.age — chưa dùng, dự kiến tính TDEE ở phase sau
    // TODO: preferences.experienceLevel — chưa dùng, dự kiến điều chỉnh độ đậm công thức

    const warnings = this.evaluateRisks(risks);
    const guidance = this.buildGuidance(goal, baseline?.activityLevel);
    const durationDays =
      preferences?.durationDays ?? DEFAULT_BASELINE.DURATION_DAYS;
    const dailySchedule = this.generateMenu(durationDays, allDrinks, dto);

    return {
      nickname,
      assessment,
      warnings,
      guidance,
      durationDays,
      dailySchedule,
      disclaimer: DISCLAIMER_TEXT,
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
      (d) =>
        !d.is_detox_core &&
        categoryName(d).includes(CATEGORY_NAMES.JUICE),
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
