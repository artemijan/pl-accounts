import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvUploadService } from './csv-upload.service';
import { CsvController } from './csv-upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlAccount, Transaction, User } from './models.entity';
import * as Joi from '@hapi/joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import { UsersService } from './user.service';
import { JwtStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('JWE_KEY'),
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWE_KEY: Joi.string().required(),
        SESSION_SECRET: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite', // Change this to your database type
      database: 'database.sqlite',
      entities: [Transaction, PlAccount, User], // Register Transaction entity here
      synchronize: true, // Set to false in production
    }),
    TypeOrmModule.forFeature([Transaction, PlAccount, User]),
  ],
  controllers: [AppController, CsvController, AuthenticationController],
  providers: [
    AppService,
    CsvUploadService,
    AuthenticationService,
    UsersService,
    JwtStrategy,
  ],
})
export class AppModule {}
