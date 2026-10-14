import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { configureApp } from './setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  const isSwaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';
  const logger = new Logger('Bootstrap');
  logger.log(`Detox API is running on: http://localhost:${port}/api`);
  if (isSwaggerEnabled) {
    logger.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
  }
}
void bootstrap();
