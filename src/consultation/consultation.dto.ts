import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
    description: 'Biệt danh hoặc tên thân mật hiển thị trên lộ trình',
    example: 'Chị Mai',
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({
    description: 'Độ tuổi (từ 15 đến 80)',
    example: 28,
  })
  @IsInt()
  @Min(15, { message: 'Độ tuổi tối thiểu là 15' })
  @Max(80, { message: 'Độ tuổi tối đa là 80' })
  age: number | undefined;

  @ApiProperty({
    description: 'Cân nặng tính bằng kg',
    example: 52,
  })
  @IsNumber()
  @IsPositive()
  weightKg: number | undefined;

  @ApiProperty({
    description: 'Chiều cao tính bằng cm',
    example: 160,
  })
  @IsNumber()
  @IsPositive()
  heightCm: number | undefined;

  @ApiProperty({
    description: 'Mức độ vận động thể chất hàng ngày',
    enum: ActivityLevel,
    example: ActivityLevel.LIGHT,
  })
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
  @ApiPropertyOptional({
    description: 'Kinh nghiệm đã từng uống sinh tố/nước ép xanh đậm đặc',
    enum: ExperienceLevel,
    example: ExperienceLevel.BEGINNER,
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({
    description:
      'Khả năng uống được vị hăng/nồng từ rau diệp lục (cần tây, cải kale)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  canDrinkBitterOrEarthy?: boolean;

  @ApiPropertyOptional({
    description: 'Số ngày lộ trình mong muốn (1, 3 hoặc 6 ngày)',
    enum: [1, 3, 6],
    example: 3,
  })
  @IsOptional()
  @IsEnum([1, 3, 6], { message: 'Gói lộ trình phải là 1, 3 hoặc 6 ngày' })
  durationDays?: 1 | 3 | 6;
}

// -------------------------------------------------------------
// Giai đoạn 4: Thẩm định an toàn & Loại trừ rủi ro
// -------------------------------------------------------------
export class HealthRisksDto {
  @ApiPropertyOptional({
    description: 'Có triệu chứng đau dạ dày, viêm loét hoặc trào ngược không',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  hasStomachPain?: boolean;

  @ApiPropertyOptional({
    description: 'Đang mang thai hoặc trong giai đoạn cho con bú',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPregnantOrNursing?: boolean;

  @ApiPropertyOptional({
    description: 'Tiền sử bệnh tiểu đường hoặc đường huyết không ổn định',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  hasDiabetes?: boolean;

  @ApiPropertyOptional({
    description: 'Danh sách các nguyên liệu gây dị ứng cần loại bỏ',
    example: ['Cần tây', 'Dứa'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];
}

// -------------------------------------------------------------
// DTO Tổng hợp (Payload client gửi lên server)
// -------------------------------------------------------------
export class SubmitConsultationDto {
  @ApiProperty({
    description: 'Thông tin thể trạng cơ sở',
    type: BaselineDto,
  })
  @ValidateNested()
  @Type(() => BaselineDto)
  @IsNotEmpty()
  baseline?: BaselineDto;

  @ApiProperty({
    description: 'Mục tiêu sức khỏe ưu tiên',
    enum: HealthGoal,
    example: HealthGoal.DETOX,
  })
  @IsEnum(HealthGoal)
  goal?: HealthGoal;

  @ApiPropertyOptional({
    description: 'Kinh nghiệm và nguyện vọng khẩu vị',
    type: PreferencesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;

  @ApiPropertyOptional({
    description: 'Các yếu tố rủi ro và an toàn sức khỏe',
    type: HealthRisksDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => HealthRisksDto)
  risks?: HealthRisksDto;
}
