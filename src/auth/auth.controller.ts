import { Body, Controller, Post } from '@nestjs/common';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './dto/register.dto.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() body: RegisterDto): Promise<UserResponseDto> {
    const result = await this.authService.register(body);
    return plainToInstance(UserResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
