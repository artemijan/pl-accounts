import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './user.service';
import RegisterDto, { CreateUserDto } from './createUser.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './models.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      return this.usersService.create({
        ...registrationData,
        password: hashedPassword,
      });
    } catch {
      throw new HttpException(
        'User with that email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public generateToken(user: User) {
    return this.jwtService.sign({
      username: user.username,
      sub: user.id,
    });
  }

  public async getAuthenticatedUser(
    username: string,
    plainTextPassword: string,
  ) {
    try {
      const user = await this.usersService.getByUsername(username);
      await this.verifyPassword(plainTextPassword, user.password);
      return user;
    } catch {
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  public async getOrCreateAuthenticatedUser(userDto: CreateUserDto) {
    try {
      const user = await this.usersService.getByUsername(userDto.username);
      if (user) {
        return (await this.verifyPassword(userDto.password, user.password))
          ? user
          : null;
      } else {
        return this.register(userDto);
      }
    } catch {
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
