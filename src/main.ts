import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TODO: [Production-Ready 1/4] Kích hoạt Graceful Shutdown để hoàn tất request dở dang khi restart/deploy
  // Code mẫu: app.enableShutdownHooks();

  // 1. Bảo vệ HTTP headers chống các lỗ hổng web phổ biến
  app.use(
    helmet({
      contentSecurityPolicy: false, // Tắt CSP để tránh chặn script/style của Swagger UI
    }),
  );

  // 2. Tiền tố toàn cục cho toàn bộ API
  app.setGlobalPrefix('api');

  // 2. Tự động kiểm tra và lọc dữ liệu request (bảo mật dữ liệu)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các trường không định nghĩa trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu client gửi trường thừa
      transform: true, // Tự động ép kiểu (vd: string "18" sang number 18)
    }),
  );

  // 3. Cho phép Frontend gọi API
  // TODO: [Production-Ready 2/4] Chuyển đổi CORS sang đọc động từ biến môi trường FRONTEND_URL
  // Code mẫu:
  // const allowedOrigins = process.env.FRONTEND_URL
  //   ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  //   : ['http://localhost:3000'];
  app.enableCors({
    origin: ['http://localhost:3000'], // Thay bằng allowedOrigins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // TODO: [Production-Ready 3/4] Bọc cấu hình Swagger trong điều kiện SWAGGER_ENABLED
  // Code mẫu:
  // const isSwaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';
  // if (isSwaggerEnabled) { ... }
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

  // 4. Chạy ở port 3001
  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  // TODO: [Production-Ready 4/4] Thay thế console.log bằng NestJS Logger chuẩn hóa
  // Code mẫu:
  // const logger = new Logger('Bootstrap');
  // logger.log(`Detox API is running on: http://localhost:${port}/api`);
  // if (isSwaggerEnabled) logger.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
  console.log(`Detox API is running on: http://localhost:${port}/api`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}
void bootstrap();
