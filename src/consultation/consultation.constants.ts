// 1. Ngưỡng phân loại BMI cho người Châu Á (Theo chuẩn IDI & WPRO)
export const BMI_THRESHOLDS = {
  UNDERWEIGHT: 18.5,
  NORMAL_MAX: 22.9,
  OVERWEIGHT_MAX: 24.9,
} as const;

// 2. Định danh các nhóm thức uống theo khung giờ
export enum MealSlotCategory {
  SMOOTHIE = 'SMOOTHIE',
  JUICE = 'JUICE',
  NUT_MILK_TEA = 'NUT_MILK_TEA',
}

// 3. Khung giờ chuẩn theo Tỷ lệ vàng 3:1:1 (Docs nghiệp vụ)
export const DAILY_MEAL_SLOTS = [
  {
    slot: 1,
    time: '07:00 - Bữa sáng',
    name: 'Sinh tố xanh khởi động',
    category: MealSlotCategory.SMOOTHIE,
    role: 'Đánh thức hệ tiêu hóa, cung cấp chất xơ hòa tan và tạo cảm giác no êm dịu',
  },
  {
    slot: 2,
    time: '10:00 - Phụ sáng',
    name: 'Nước ép tươi bù khoáng',
    category: MealSlotCategory.JUICE,
    role: 'Bổ sung nhanh vi chất, enzyme chuyển hóa và bù nước',
  },
  {
    slot: 3,
    time: '13:00 - Bữa trưa',
    name: 'Sinh tố xanh phục hồi',
    category: MealSlotCategory.SMOOTHIE,
    role: 'Duy trì năng lượng bền bỉ, ổn định đường huyết giữa ngày',
  },
  {
    slot: 4,
    time: '16:00 - Xế chiều',
    name: 'Sinh tố xanh tăng cường',
    category: MealSlotCategory.SMOOTHIE,
    role: 'Tiếp thêm năng lượng, xua tan cảm giác mệt mỏi cuối ngày làm việc',
  },
  {
    slot: 5,
    time: '19:00 - Bữa tối',
    name: 'Sữa hạt dinh dưỡng / Trà thảo mộc',
    category: MealSlotCategory.NUT_MILK_TEA,
    role: 'Cung cấp chất béo tốt lành tính, xoa dịu đường ruột và hỗ trợ ngủ sâu',
  },
] as const;

// 4. Giá trị mặc định an toàn cho thể trạng nếu client gửi thiếu
export const DEFAULT_BASELINE = {
  WEIGHT_KG: 50,
  HEIGHT_CM: 160,
  DURATION_DAYS: 1,
  DEFAULT_NAME: 'Bạn',
} as const;

// 5. Tên category trong database — dùng để phân loại drink theo nhóm cữ uống
export const CATEGORY_NAMES = {
  SMOOTHIE: 'Sinh tố',
  JUICE: 'Nước ép',
  NUT_MILK: 'Sữa',
  TEA: 'Trà',
} as const;

// 6. Chuỗi mặc định cho menu output
export const MENU_STRINGS = {
  DAY_TITLE: (day: number) => `Ngày ${day}: Nhịp điệu thanh lọc cân bằng`,
  FALLBACK_DRINK: 'Thức uống thanh lọc tiêu chuẩn',
} as const;

// 7. Disclaimer pháp lý
export const DISCLAIMER_TEXT =
  'Hệ thống cung cấp gợi ý hỗ trợ lối sống và dinh dưỡng, không chẩn đoán bệnh và không thay thế phác đồ điều trị y khoa.';

// 8. Ngưỡng level xác định vị đắng/hăng — drink có level >= ngưỡng này được coi là vị đậm
// ponytail: nếu sau này DB có cột `is_bitter` riêng thì dùng cột đó thay thế
export const BITTER_LEVEL_THRESHOLD = 70;
