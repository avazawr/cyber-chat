import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { User } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';
import argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './auth.types.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const passwordHash = await argon2.hash(dto.password);
    return this.usersService.create(dto.username, passwordHash);
  }

  async login(dto: LoginDto): Promise<string> {
    let user;
    try {
      user = await this.usersService.findByUsername(dto.username);
    } catch {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return this.jwtService.signAsync({ sub: user.id, username: user.username });
  }
}
