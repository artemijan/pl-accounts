import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import * as path from 'node:path';
import { engine } from 'express-handlebars';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.engine(
    'hbs',
    engine({
      extname: 'hbs',
      defaultLayout: 'base',
      layoutsDir: path.join(__dirname, '..', 'views/'), // Update path if necessary
      helpers: {
        extend: function (name, options) {
          const template = options.fn(this);
          if (!this._blocks) {
            this._blocks = {};
          }
          this._blocks[name] = template;
          return null;
        },
        gt: (a, b) => {
          return a > b;
        },
        eq: (a, b) => {
          return a === b;
        },
        lt: (a, b) => {
          return a < b;
        },
        range: (start, end) => {
          const result = [];
          for (let i = start; i <= end; i++) {
            result.push(i);
          }
          return result;
        },
        dec: (value) => value - 1,
        inc: (value) => value + 1,
        block: function (name) {
          return this._blocks && this._blocks[name] ? this._blocks[name] : '';
        },
      },
    }),
  );
  app.setViewEngine('hbs');

  const configService = app.get(ConfigService);
  // Setup session

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
