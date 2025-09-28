import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
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
    return isMatch ? { id: user.id, email: user.email, role: user.id } : null;
  }

  async login(user: { id: number; email: string, role: number }) {
    return { access_token: this.jwtService.sign(user) };
  }

  async register(body: IUserRegister) {
    try {
      const existingUser = await this.userService.findByEmail(body.email);
      if (existingUser) {
        throw new UnauthorizedException('Email already in use');
      }
      const passwordHash = await this.userService.hashPassword(body.password);
      const user = await this.userService.createUser({ ...body, password: passwordHash });
      return user;
    } catch (error) {
      throw error;
    }
  }
}
