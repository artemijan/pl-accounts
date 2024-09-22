import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import CreateUserDto from './createUser.dto';
import { Response } from 'express';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @HttpCode(HttpStatus.OK)
  @Get('logout')
  async logout(@Res() response: Response) {
    response.cookie('jwt', null);
    response.send({});
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async logIn(@Body() body: CreateUserDto, @Res() response: Response) {
    const user =
      await this.authenticationService.getOrCreateAuthenticatedUser(body);
    if (!user) {
      response.sendStatus(HttpStatus.UNAUTHORIZED);
      return;
    }
    response.setHeader('Content-Type', 'application/json');
    const token = this.authenticationService.generateToken(user);
    response.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set `secure: true` in production
      maxAge: 60 * 60 * 1000, // 1 hour expiration
    });
    response.send({ id: user.id, username: user.username });
  }
}
