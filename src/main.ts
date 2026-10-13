import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Tiền tố toàn cục cho toàn bộ API
  app.setGlobalPrefix('api');

  // 2. Tự động kiểm tra và lọc dữ liệu request (bảo mật dữ liệu)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Loại bỏ các trường không định nghĩa trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu client gửi trường thừa
      transform: true,            // Tự động ép kiểu (vd: string "18" sang number 18)
    }),
  );

  // 3. Cho phép Frontend gọi API
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 4. Chạy ở port 3001
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Detox API is running on: http://localhost:${port}/api`);
}
void bootstrap();
