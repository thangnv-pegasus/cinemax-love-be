import { Controller, Post, Body, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserInterceptor } from '@/user/interceptor/user.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    return this.authService.login(user);
  }

  @Post('register')
  @UseInterceptors(UserInterceptor)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
