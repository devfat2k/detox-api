import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// -------------------------------------------------------------
// Giai đoạn 1: Sàng lọc thể trạng cơ sở
// -------------------------------------------------------------
export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY', // Ít vận động / Nhân viên văn phòng
  LIGHT = 'LIGHT', // Vận động nhẹ (đi bộ, yoga nhẹ 1-3 ngày/tuần)
  MODERATE = 'MODERATE', // Vận động vừa phải (thể dục 3-5 ngày/tuần)
  VERY_ACTIVE = 'VERY_ACTIVE', // Vận động nhiều / Lao động nặng
}

export class BaselineDto {
  @IsOptional()
  @IsString()
  nickname?: string; // Tên/biệt danh thân mật để xưng hô trên menu

  @IsInt()
  @Min(15, { message: 'Độ tuổi tối thiểu là 15' })
  @Max(80, { message: 'Độ tuổi tối đa là 80' })
  age: number | undefined; // Tuổi phục vụ tính toán chuyển hóa

  @IsNumber()
  @IsPositive()
  weightKg: number | undefined; // Cân nặng (kg)

  @IsNumber()
  @IsPositive()
  heightCm: number | undefined; // Chiều cao (cm)

  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel | undefined;
}

// -------------------------------------------------------------
// Giai đoạn 2: Định hình mục tiêu sức khỏe
// -------------------------------------------------------------
export enum HealthGoal {
  DETOX = 'DETOX', // Thanh lọc, nhẹ bụng sau kỳ ăn uống nhiều dầu mỡ
  WEIGHT_LOSS = 'WEIGHT_LOSS', // Hỗ trợ kiểm soát vóc dáng, giảm áp lực calo
  BEAUTY_SKIN = 'BEAUTY_SKIN', // Đẹp da, cấp ẩm, bổ sung chất chống oxy hóa
  DIGESTION = 'DIGESTION', // Cải thiện đường ruột, hỗ trợ tiêu hóa êm dịu
}

// -------------------------------------------------------------
// Giai đoạn 3: Xác định kinh nghiệm & Khẩu vị
// -------------------------------------------------------------
export enum ExperienceLevel {
  BEGINNER = 'BEGINNER', // Mới bắt đầu, chưa từng uống nước ép xanh đậm vị
  EXPERIENCED = 'EXPERIENCED', // Đã quen uống ép xanh/sinh tố xanh đậm đặc
}

export class PreferencesDto {
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @IsBoolean()
  canDrinkBitterOrEarthy?: boolean; // Có uống được vị hăng/nồng (cần tây, cải kale) không

  @IsEnum([1, 3, 6], { message: 'Gói lộ trình phải là 1, 3 hoặc 6 ngày' })
  durationDays?: 1 | 3 | 6; // Lựa chọn gói 1 ngày, 3 ngày hoặc 6 ngày
}

// -------------------------------------------------------------
// Giai đoạn 4: Thẩm định an toàn & Loại trừ rủi ro
// -------------------------------------------------------------
export class HealthRisksDto {
  @IsBoolean()
  hasStomachPain?: boolean; // Có đau dạ dày, viêm loét hoặc trào ngược không

  @IsBoolean()
  isPregnantOrNursing?: boolean; // Đang mang thai hoặc cho con bú

  @IsBoolean()
  hasDiabetes?: boolean; // Có tiền sử tiểu đường / đường huyết không ổn định

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[]; // Danh sách dị ứng thực phẩm (dứa, cần tây, đậu phộng...)
}

// -------------------------------------------------------------
// DTO Tổng hợp (Payload client gửi lên server)
// -------------------------------------------------------------
export class SubmitConsultationDto {
  @ValidateNested()
  @Type(() => BaselineDto)
  @IsNotEmpty()
  baseline?: BaselineDto;

  @IsEnum(HealthGoal)
  goal?: HealthGoal;

  @ValidateNested()
  @Type(() => PreferencesDto)
  @IsNotEmpty()
  preferences?: PreferencesDto;

  @ValidateNested()
  @Type(() => HealthRisksDto)
  @IsNotEmpty()
  risks?: HealthRisksDto;
}
