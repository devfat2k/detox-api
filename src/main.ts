import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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
  console.log(`Detox API is running on: http://localhost:${port}/api`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}
void bootstrap();
