import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import RegisterDto from './createUser.dto';
import CreateUserDto from './createUser.dto';
import RequestWithUser from './requestWithUser.interface';
import { Response } from 'express';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }

  @Get('logout')
  async logout(@Res() response: Response) {
    response.cookie('jwt', null);
    return response.redirect('/auth/login');
  }

  @Render('login')
  @Post('login')
  async logIn(
    @Body() body: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user =
      await this.authenticationService.getOrCreateAuthenticatedUser(body);
    if (!user) {
      return {
        error: 'Wrong credentials',
      };
    }
    const token = this.authenticationService.generateToken(user);
    response.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set `secure: true` in production
      maxAge: 60 * 60 * 1000, // 1 hour expiration
    });

    return response.redirect('/');
  }

  @Render('login')
  @Get('login')
  async loginPage(@Req() request: RequestWithUser, @Res() res: Response) {
    if (request.user) {
      return res.redirect('/');
    }
    return {};
  }
}
