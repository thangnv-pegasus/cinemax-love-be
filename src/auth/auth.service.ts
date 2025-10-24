import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Request, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { IUserRegister } from '@/user/interface/user';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;
    const isMatch = await this.userService.validatePassword(password, user.password);
    return isMatch ? { id: user.id, email: user.email, name: user.name, role: user.role } : null;
  }

  async login(user: { id: number; email: string; name: string; role: number }, req: any) {
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(user),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    };
  }

  async register(body: IUserRegister) {
    const existingUser = await this.userService.findByEmail(body.email);
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    try {
      const passwordHash = await this.userService.hashPassword(body.password);
      const user = await this.userService.createUser({
        name: body.name,
        email: body.email,
        password: passwordHash,
        role: body.role
      });
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Đăng ký thất bại, vui lòng thử lại sau');
    }
  }

  async logout() {
  }
}
