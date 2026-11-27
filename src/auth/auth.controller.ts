import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './dto/register.dto.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from '../auth/public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async registerUser(@Body() body: RegisterDto): Promise<UserResponseDto> {
    const result = await this.authService.register(body);
    return plainToInstance(UserResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.login(dto);
    return { accessToken };
  }
}
