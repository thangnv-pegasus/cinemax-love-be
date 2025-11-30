import { Controller, Post, Body, UnauthorizedException, UseInterceptors, Req, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserInterceptor } from '@/user/interceptor/user.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // cú pháp định nghĩa api auth/login
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    return this.authService.login(user, req);
  }

  // cú pháp định nghĩa api đăng ký tài khoản /auth/register
  @Post('register')
  @UseInterceptors(UserInterceptor)
  async register(@Body() dto: RegisterDto) {
    if(dto.password.trim() !== dto.confirm_password.trim()) {
      throw new BadRequestException({
      statusCode: 400,
      message: 'Mật khẩu và xác nhận mật khẩu không khớp',
      error: 'Bad Request',
    });
    }
    return this.authService.register(dto);
  }

  // cú pháp định nghĩa api đăng xuất /auth/logout
  @Post('logout')
  async logout(@Req() req: any) {
    req.session.destroy((err) => {   
      if (err) throw new InternalServerErrorException('Logout failed');
    });
    return { message: 'Logged out successfully' };
  }
}
