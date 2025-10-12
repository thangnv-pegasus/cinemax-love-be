import { Controller, Post, Body, UnauthorizedException, UseInterceptors, Req, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserInterceptor } from '@/user/interceptor/user.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    return this.authService.login(user, req);
  }

  @Post('register')
  @UseInterceptors(UserInterceptor)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('logout')
  async logout(@Req() req: any) {
    req.session.destroy((err) => {   
      if (err) throw new InternalServerErrorException('Logout failed');
    });
    return { message: 'Logged out successfully' };
  }
}
