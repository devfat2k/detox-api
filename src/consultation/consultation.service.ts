import { Injectable } from '@nestjs/common';
import {
  ActivityLevel,
  HealthGoal,
  HealthRisksDto,
  SubmitConsultationDto,
} from './consultation.dto';

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
  generateConsultation(dto: SubmitConsultationDto): ConsultationResult {
    const { baseline, goal, preferences, risks } = dto;

    const nickname = baseline?.nickname?.trim() || 'Bạn';
    const weight = baseline?.weightKg ?? 50;
    const height = baseline?.heightCm ?? 160;
    const assessment = this.calculateBmi(weight, height);

    const warnings = this.evaluateRisks(risks);
    const guidance = this.buildGuidance(goal, baseline?.activityLevel);
    const durationDays = preferences?.durationDays ?? 1;
    const dailySchedule = this.generateMenu(durationDays, dto);

    return {
      nickname,
      assessment,
      warnings,
      guidance,
      durationDays,
      dailySchedule,
      disclaimer:
        'Hệ thống cung cấp gợi ý hỗ trợ lối sống và dinh dưỡng, không chẩn đoán bệnh và không thay thế phác đồ điều trị y khoa.',
    };
  }

  private calculateBmi(weightKg: number, heightCm: number): BmiAssessment {
    const heightM = heightCm / 100;
    const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

    let category = 'Thể trạng cân đối';
    let recommendationNote =
      'Duy trì chế độ dinh dưỡng cân bằng và kết hợp detox nhẹ nhàng.';

    if (bmi < 18.5) {
      category = 'Thiếu cân';
      recommendationNote =
        'Nên ưu tiên sinh tố giàu dinh dưỡng, sữa hạt và không nhịn ăn hoàn toàn.';
    } else if (bmi >= 23 && bmi < 25) {
      category = 'Tiền béo phì (Thừa cân nhẹ)';
      recommendationNote =
        'Phù hợp với lộ trình cắt giảm calo rỗng và tăng cường chất xơ từ rau lá xanh.';
    } else if (bmi >= 25) {
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

  private buildGuidance(
    goal?: HealthGoal,
    activity?: ActivityLevel,
  ): string[] {
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

  private generateMenu(days: number, dto: SubmitConsultationDto): DayPlan[] {
    const bitterOk = dto.preferences?.canDrinkBitterOrEarthy ?? false;

    const baseSchedule: Omit<MealSlot, 'suggestedItems'>[] = [
      {
        slot: 1,
        time: '07:00 - Bữa sáng',
        name: 'Sinh tố xanh khởi động',
        category: 'SMOOTHIE',
        role: 'Đánh thức hệ tiêu hóa, cung cấp chất xơ hòa tan và tạo cảm giác no êm dịu',
      },
      {
        slot: 2,
        time: '10:00 - Phụ sáng',
        name: 'Nước ép tươi bù khoáng',
        category: 'JUICE',
        role: 'Bổ sung nhanh vi chất, enzyme chuyển hóa và bù nước',
      },
      {
        slot: 3,
        time: '13:00 - Bữa trưa',
        name: 'Sinh tố xanh phục hồi',
        category: 'SMOOTHIE',
        role: 'Duy trì năng lượng bền bỉ, ổn định đường huyết giữa ngày',
      },
      {
        slot: 4,
        time: '16:00 - Xế chiều',
        name: 'Sinh tố xanh tăng cường',
        category: 'SMOOTHIE',
        role: 'Tiếp thêm năng lượng, xua tan cảm giác mệt mỏi cuối ngày làm việc',
      },
      {
        slot: 5,
        time: '19:00 - Bữa tối',
        name: 'Sữa hạt dinh dưỡng / Trà thảo mộc',
        category: 'NUT_MILK_TEA',
        role: 'Cung cấp chất béo tốt lành tính, xoa dịu đường ruột và hỗ trợ ngủ sâu',
      },
    ];

    const menuItemsByDay: Record<
      number,
      Record<number, string[]>
    > = {
      1: {
        1: [bitterOk ? 'Sinh tố Kale Chuối Hạt Chia' : 'Sinh tố Bó Xôi Xoài Chuối'],
        2: ['Nước ép Cần Tây Táo Xanh Dưa Leo'],
        3: ['Sinh tố Bơ Chuối Cải Bó Xôi'],
        4: ['Sinh tố Táo Xanh Cải Kale Hạt Lanh'],
        5: ['Sữa Hạt Điều Hạnh Nhân Nguyên Chất'],
      },
      2: {
        1: ['Sinh tố Cải Bó Xôi Dứa Chuối'],
        2: ['Nước ép Cà Rốt Táo Cam'],
        3: ['Sinh tố Kale Bơ Hạt Chia'],
        4: ['Sinh tố Việt Quất Chuối Rau Bina'],
        5: ['Sữa Yến Mạch Hạt Sen'],
      },
      3: {
        1: ['Sinh tố Xanh Nhiệt Đới (Cải xoăn, Xoài, Chuối)'],
        2: ['Nước ép Bưởi Táo Cần Tây'],
        3: ['Sinh tố Bơ Hạnh Nhân Bó Xôi'],
        4: ['Sinh tố Táo Gừng Cải Kale'],
        5: ['Trà Thảo Mộc Hoa Cúc Táo Đỏ'],
      },
      4: {
        1: ['Sinh tố Bó Xôi Dâu Tây Hạt Chia'],
        2: ['Nước ép Cần Tây Dưa Chuột Chanh'],
        3: ['Sinh tố Kale Chuối Bơ Đậu Phộng Nhẹ'],
        4: ['Sinh tố Xoài Rau Bina Bạc Hà'],
        5: ['Sữa Hạt Điều Yến Mạch'],
      },
      5: {
        1: ['Sinh tố Xanh Năng Lượng (Kale, Chuối, Hạt Lanh)'],
        2: ['Nước ép Cà Rốt Củ Dền Táo'],
        3: ['Sinh tố Bơ Cải Bó Xôi Sữa Hạnh Nhân'],
        4: ['Sinh tố Kiwi Chuối Rau Bina'],
        5: ['Sữa Hạnh Nhân Hạt Chia'],
      },
      6: {
        1: ['Sinh tố Detox Toàn Diện (Kale, Táo Xanh, Chuối)'],
        2: ['Nước ép Thơm Cần Tây Gừng'],
        3: ['Sinh tố Bơ Bó Xôi Hạt Sen'],
        4: ['Sinh tố Dâu Tằm Chuối Rau Xanh'],
        5: ['Trà Thảo Mộc Kỷ Tử Hoa Cúc'],
      },
    };

    const schedule: DayPlan[] = [];
    for (let day = 1; day <= days; day++) {
      const dayCycle = ((day - 1) % 6) + 1;
      const dayItems = menuItemsByDay[dayCycle] || menuItemsByDay[1];

      schedule.push({
        day,
        title: `Ngày ${day}: Nhịp điệu thanh lọc cân bằng`,
        meals: baseSchedule.map((item) => ({
          ...item,
          suggestedItems: dayItems[item.slot] || ['Thức uống thanh lọc tiêu chuẩn'],
        })),
      });
    }

    return schedule;
  }
}
