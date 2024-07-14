import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import { AllExceptionsFilter } from './common/exceptions/base.exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';
import fastifyCookie from '@fastify/cookie';
import { generateDocument } from './doc';

declare const module: any;

async function bootstrap() {
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.register(fastifyCookie, {
    secret: 'my-secret', // for cookies signature
  });

  // 启动全局字段校验，保证请求接口字段校验正确。
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // 统一响应体格式
  app.useGlobalInterceptors(new TransformInterceptor());

  // 接口版本化管理
  app.enableVersioning({
    type: VersioningType.URI,
  });

  generateDocument(app);

  await app.listen(3000);
}
bootstrap();
