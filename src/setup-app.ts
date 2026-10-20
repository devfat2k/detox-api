import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as helmetPkg from 'helmet';
import express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// ponytail: helmet CJS/ESM interop — NodeNext resolves to CJS types where default export
// is the namespace itself; pick the callable from either shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const helmet = ((helmetPkg as any).default ?? helmetPkg) as (options?: any) => any;

export function configureApp(app: INestApplication): void {
  // 1. Kích hoạt shutdown hooks để đóng kết nối an toàn khi tắt app
  app.enableShutdownHooks();

  // 2. Bảo vệ HTTP headers chống các lỗ hổng web phổ biến
  app.use(
    helmet({
      contentSecurityPolicy: false, // Tắt CSP để tránh chặn script/style của Swagger UI
    }),
  );

  // 2b. Giới hạn kích thước request body
  // ponytail: 1MB đủ cho JSON thông thường. Nâng lên nếu cần nhận payload lớn hơn.
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 3. Tiền tố toàn cục cho toàn bộ API
  app.setGlobalPrefix('api');

  // 4. Tự động kiểm tra và lọc dữ liệu request (bảo mật dữ liệu)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các trường không định nghĩa trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu client gửi trường thừa
      transform: true, // Tự động ép kiểu (vd: string "18" sang number 18)
    }),
  );

  // 5. Cấu hình CORS
  const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : [];

  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:3000',
    'https://detox-web.vercel.app',
    /\.vercel\.app$/,
    ...envOrigins,
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 6. Cấu hình Swagger
  const isSwaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';
  if (isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Detox API - Ép Xanh Chữa Lành')
      .setDescription(
        'Hệ thống API quản lý thực đơn và tư vấn lộ trình nước ép thanh lọc cá nhân hóa',
      )
      .setVersion('1.0')
      .addTag('Consultation', 'Khảo sát thể trạng và sinh lộ trình detox 3:1:1')
      .addTag('Plans', 'Quản lý các gói lộ trình tiêu chuẩn (1, 3, 6 ngày)')
      .addTag('Drinks', 'Quản lý danh sách và chi tiết thức uống')
      .addTag('Categories', 'Quản lý nhóm danh mục sản phẩm')
      .addTag('Media', 'Upload hình ảnh lên Cloudinary')
      .addTag('Health', 'Kiểm tra trạng thái liveness & kết nối database')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
}
