import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const response = context.switchToHttp().getResponse<Response>();
    if (err || !user) {
      // Redirect to login page if user is not authenticated
      response.redirect('/auth/login'); // replace with your login route
      throw new UnauthorizedException();
    }

    return user;
  }
}
