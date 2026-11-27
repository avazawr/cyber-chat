import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { User } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';
import argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto): Promise<User> {
    const passwordHash = await argon2.hash(dto.password);
    return this.usersService.create(dto.username, passwordHash);
  }
}
