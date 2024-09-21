import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { User } from './models.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.jwt; // Extract JWT from the cookie
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWE_KEY'),
    });
  }

  async validate(payload: any): Promise<User> {
    return new User(payload.sub, payload.username);
  }
}
