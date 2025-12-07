import dotenv from 'dotenv-flow';
dotenv.config({ silent: true });

if (process.env.SECRETS && process.env.SECRETS.length) {
  Object.assign(process.env, {
    ...process.env,
    ...JSON.parse(process.env.SECRETS),
  });
}

import { AppModule } from './app.module';
import config from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/allexception.filter';

async function bootstrap() {
  const cfg = config(process.env);

  const app = await NestFactory.create(AppModule, {});

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(HttpAdapterHost).httpAdapter),
  );

  await app.listen(cfg.app.port);
  Logger.log(`Server started at port ${cfg.app.port}`);
}
bootstrap();
