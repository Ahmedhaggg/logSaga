import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // global prefix
  app.setGlobalPrefix('api');

  // class validator
  app.useGlobalPipes(new ValidationPipe());

  // swagger docs
  const config = new DocumentBuilder()
    .setTitle('Log Saga API')
    .setDescription('The Log Saga API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // start app
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
