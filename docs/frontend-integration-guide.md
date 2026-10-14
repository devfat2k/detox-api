# Hướng Dẫn Tích Hợp API Dành Cho Frontend (Detox API)

Tài liệu kỹ thuật đặc tả hợp đồng dữ liệu (API Contract) và hướng dẫn tích hợp chi tiết giữa Frontend và Backend cho hệ sinh thái **"Ép Xanh Chữa Lành"**.

---

## 1. Thông Tin Môi Trường & Thiết Lập Chung

### 1.1. Base URL
- **Production Base URL**: `https://detox-api-black.vercel.app/api`
- **Deployment URL**: `https://detox-gzbktyjwx-huuphat26s-projects.vercel.app/api`
- **Local Dev Base URL**: `http://localhost:3001/api`

### 1.2. Quy Chuẩn Headers & CORS
- **Headers**: Mọi request gửi kèm body phải có header `Content-Type: application/json`.
- **CORS**: Backend chỉ cho phép các domain được khai báo trong biến `FRONTEND_URL` (hỗ trợ `credentials: true`).
- **Authentication**: Hệ thống **không** yêu cầu Auth/Token, toàn bộ khảo sát thể trạng hoạt động theo phiên người dùng (*Session-scoped*).

---

## 2. Cấu Trúc Dữ Liệu Quy Chuẩn (Standard Response Envelope)

Toàn bộ API được chuẩn hóa qua 2 lớp bộ lọc toàn cục: `TransformInterceptor` (phản hồi thành công) và `AllExceptionsFilter` (phản hồi lỗi).

### 2.1. Phản hồi thành công (HTTP 200, 201)
```typescript
interface ApiResponse<T> {
  success: true;
  statusCode: number; // 200, 201
  message: string;    // "Thao tác thành công" hoặc thông báo tùy biến
  data: T;            // Dữ liệu nghiệp vụ trả về
  timestamp: string;  // ISO 8601 string: "2026-10-14T15:30:00.000Z"
  path: string;       // Endpoint được gọi: "/api/drinks"
}
```

### 2.2. Phản hồi thất bại / Lỗi Validation (HTTP 400, 404, 500)
```typescript
interface ApiErrorResponse {
  success: false;
  statusCode: number; // 400, 404, 500
  message: string;    // Thông báo lỗi tổng quát
  errors?: string[];  // Danh sách chi tiết các lỗi validation (nếu có)
  timestamp: string;
  path: string;
}
```

*Ví dụ khi FE gửi thiếu trường bắt buộc (`HTTP 400`):*
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Dữ liệu gửi lên không hợp lệ",
  "errors": [
    "Độ tuổi tối thiểu là 15",
    "goal must be one of the following values: DETOX, WEIGHT_LOSS, BEAUTY_SKIN, DIGESTION"
  ],
  "timestamp": "2026-10-14T15:30:00.000Z",
  "path": "/api/consultation"
}
```

---

## 3. Đặc Tả Chi Tiết Các Endpoints

### 3.1. Phân Hệ Tư Vấn & Sinh Lộ Trình (Consultation Flow)

#### `POST /api/consultation`
Gửi thông tin khảo sát 4 giai đoạn để nhận kết quả phân tích chỉ số thể trạng, cảnh báo an toàn và gợi ý lộ trình/thức uống cá nhân hóa.

- **Request Body (JSON)**:
```json
{
  "baseline": {
    "nickname": "Chị Mai",
    "age": 28,
    "weightKg": 52,
    "heightCm": 160,
    "activityLevel": "LIGHT"
  },
  "goal": "DETOX",
  "preferences": {
    "experienceLevel": "BEGINNER",
    "canDrinkBitterOrEarthy": false,
    "durationDays": 3
  },
  "risks": {
    "hasStomachPain": false,
    "isPregnantOrNursing": false,
    "hasDiabetes": false,
    "allergies": ["Cần tây"]
  }
}
```

- **Quy tắc giá trị (Enums & Rules)**:
  - `baseline.age`: Số nguyên từ `15` đến `80`.
  - `baseline.weightKg` / `baseline.heightCm`: Số dương `> 0`.
  - `baseline.activityLevel`: `"SEDENTARY"` | `"LIGHT"` | `"MODERATE"` | `"VERY_ACTIVE"`.
  - `goal`: `"DETOX"` | `"WEIGHT_LOSS"` | `"BEAUTY_SKIN"` | `"DIGESTION"`.
  - `preferences.experienceLevel`: `"BEGINNER"` | `"EXPERIENCED"`.
  - `preferences.durationDays`: `1` | `3` | `6`.
  - `risks.allergies`: Mảng chuỗi nguyên liệu dị ứng (vd: `["Cần tây", "Dứa"]`).

- **Response Body (`data`)**:
```json
{
  "bmi": 20.31,
  "bmiCategory": "Bình thường",
  "dailyWaterMl": 2080,
  "safetyAlerts": [
    "Lưu ý: Bạn có tiền sử dạ dày nhạy cảm. Hệ thống đã tự động thay thế các món có tính axit cao (dứa, cam chua)."
  ],
  "recommendedPlan": {
    "id": "uuid-plan-3-days",
    "name": "Gói Cân Bằng 3 Ngày",
    "slug": "goi-can-bang-3-ngay",
    "duration_days": 3,
    "description": "Lộ trình thải độc êm dịu, khởi động tiêu hóa"
  },
  "scheduleRatio": "3:1:1",
  "drinks": [
    {
      "id": "uuid-drink-1",
      "name": "Sinh Tố Xanh Khởi Động",
      "slug": "sinh-to-xanh-khoi-dong",
      "category_name": "Sinh tố xanh",
      "calories": 145,
      "time_slot": "Buổi sáng (Bữa chính)",
      "ingredients": ["Cải bó xôi", "Chuối", "Hạt chia", "Sữa yến mạch"]
    }
  ]
}
```

---

### 3.2. Phân Hệ Danh Mục & Thực Đơn (Catalog & Drinks)

#### `GET /api/categories`
Lấy danh sách các nhóm sản phẩm (phục vụ render tabs bộ lọc trên UI).

- **Response (`data`)**:
```json
[
  {
    "id": "c1000000-0000-0000-0000-000000000001",
    "name": "Sinh tố xanh",
    "slug": "sinh-to-xanh",
    "description": "Thức uống giàu xơ và diệp lục thay thế bữa chính"
  },
  {
    "id": "c1000000-0000-0000-0000-000000000002",
    "name": "Nước ép nguyên chất",
    "slug": "nuoc-ep-nguyen-chat",
    "description": "Thanh lọc nhanh, cấp ẩm và vitamin"
  }
]
```

---

#### `GET /api/drinks`
Lấy danh sách thức uống có hỗ trợ Query Filters.

- **Query Parameters**:
  - `category_id` (string, UUID): Lọc theo ID danh mục.
  - `target_goal` (string): Lọc theo mục tiêu (`"DETOX"`, `"WEIGHT_LOSS"`, `"BEAUTY_SKIN"`, `"DIGESTION"`).
  - `is_detox_core` (boolean: `true` | `false`): Lọc các món cốt lõi thải độc.
- **Ví dụ**: `GET /api/drinks?target_goal=DETOX&is_detox_core=true`
- **Response (`data`)**:
```json
[
  {
    "id": "d1000000-0000-0000-0000-000000000001",
    "name": "Sinh tố Kale Chuối Hạt Chia",
    "slug": "sinh-to-kale-chuoi-chia",
    "description": "Bữa sáng xanh nhẹ bụng, giàu omega-3",
    "calories": 160,
    "target_goal": "DETOX",
    "is_detox_core": true,
    "image_url": "https://res.cloudinary.com/.../kale-smoothie.webp",
    "ingredients": ["Cải kale", "Chuối chín", "Hạt chia", "Sữa hạnh nhân"]
  }
]
```

---

#### `GET /api/drinks/:slug`
Xem chi tiết một món thức uống theo đường dẫn thân thiện (slug).

- **Ví dụ**: `GET /api/drinks/sinh-to-kale-chuoi-chia`
- **Response (`data`)**: Chi tiết công thức, lưu ý sử dụng, thành phần dinh dưỡng.

---

### 3.3. Phân Hệ Gói Lộ Trình Chuẩn (Standard Plans)

#### `GET /api/plans`
Lấy danh sách các gói detox có sẵn (1 ngày, 3 ngày, 6 ngày).

- **Response (`data`)**:
```json
[
  {
    "id": "p1000000-0000-0000-0000-000000000001",
    "name": "Gói Khởi Động 1 Ngày",
    "slug": "goi-khoi-dong-1-ngay",
    "duration_days": 1,
    "description": "Trải nghiệm thanh lọc nhanh cuối tuần"
  },
  {
    "id": "p1000000-0000-0000-0000-000000000002",
    "name": "Gói Cân Bằng 3 Ngày",
    "slug": "goi-can-bang-3-ngay",
    "duration_days": 3,
    "description": "Lộ trình phục hồi năng lượng và hệ vi sinh đường ruột"
  }
]
```

#### `GET /api/plans/:slug`
Lấy chi tiết kế hoạch từng ngày của một gói lộ trình.
- **Ví dụ**: `GET /api/plans/goi-can-bang-3-ngay`

---

### 3.4. Hệ Thống Kiểm Tra Trạng Thái (System Health)

#### `GET /api/health`
Dùng cho kiểm tra tình trạng hoạt động (*Liveness Probe*):
- **Response** (HTTP 200 khi bình thường, HTTP 503 khi gặp sự cố):
```json
{
  "status": "ok",
  "info": {
    "memory_heap": { "status": "up" },
    "supabase": { "status": "up" }
  }
}
```

---

## 4. TypeScript Types / Interfaces (Copy-paste trực tiếp vào FE)

```typescript
// types/api.ts

export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE';
export type HealthGoal = 'DETOX' | 'WEIGHT_LOSS' | 'BEAUTY_SKIN' | 'DIGESTION';
export type ExperienceLevel = 'BEGINNER' | 'EXPERIENCED';

export interface Baseline {
  nickname?: string;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
}

export interface Preferences {
  experienceLevel?: ExperienceLevel;
  canDrinkBitterOrEarthy?: boolean;
  durationDays?: 1 | 3 | 6;
}

export interface HealthRisks {
  hasStomachPain?: boolean;
  isPregnantOrNursing?: boolean;
  hasDiabetes?: boolean;
  allergies?: string[];
}

export interface ConsultationPayload {
  baseline: Baseline;
  goal: HealthGoal;
  preferences?: Preferences;
  risks?: HealthRisks;
}

export interface Drink {
  id: string;
  name: string;
  slug: string;
  description?: string;
  calories?: number;
  target_goal?: HealthGoal;
  is_detox_core?: boolean;
  image_url?: string;
  ingredients?: string[];
  category_id?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  duration_days: number;
  description?: string;
}

export interface ConsultationResult {
  bmi: number;
  bmiCategory: string;
  dailyWaterMl: number;
  safetyAlerts: string[];
  recommendedPlan?: Plan;
  scheduleRatio: string;
  drinks: Drink[];
}
```

---

## 5. Code Mẫu Tích Hợp Client (Axios Client Wrapper)

```typescript
// lib/api-client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://detox-api-black.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Tự động bóc tách envelope { success: true, data: T }
apiClient.interceptors.response.use(
  (response) => {
    // Nếu có bọc trong ApiResponse standard envelope thì trả về data bên trong
    if (response.data && response.data.success === true && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const errorData = error.response?.data;
    const message = errorData?.errors?.join(', ') || errorData?.message || 'Có lỗi xảy ra, vui lòng thử lại';
    return Promise.reject(new Error(message));
  }
);
```
