import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  app.enableCors();
  // Enable session handling
  app.use(
    session({
      secret: configService.get('SESSION_SECRET'), // Use a secure secret
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(3000);
}

bootstrap();
