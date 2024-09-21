import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import RequestWithUser from './requestWithUser.interface';
import { Response } from 'express';
import { JwtAuthGuard } from './loginWithCredentialsGuard.guard';

@Controller()
export class AppController {
  @Render('index')
  @UseGuards(JwtAuthGuard)
  @Get()
  async home(@Req() request: RequestWithUser, @Res() res: Response) {
    if (!request.user) {
      return res.redirect('/auth/login');
    }
    return { user: request.user };
  }
}
