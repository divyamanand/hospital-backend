import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: (origin: string | undefined, cb: (err: any, allow?: boolean) => void) => cb(null, true),
    credentials: true,
  });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log();
}
bootstrap();
