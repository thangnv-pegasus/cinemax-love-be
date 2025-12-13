import { RegisterDto } from '@/auth/dto/register.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRegister } from './interface/user';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        deleted_at: null
      }
    });
  }
  async validatePassword(plainText: string, hashed: string) {
    // Implement your password validation logic here, e.g., using bcrypt
    return bcrypt.compare(plainText, hashed);
  }
  async hashPassword(password: string) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
  async createUser(data: IUserRegister) {
    const now = new Date();
    return this.prisma.user.create({
      data: {
        ...data,
        created_at: now,
        updated_at: now
      }
    });
  }
  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  async findAll() {
    return this.prisma.user.findMany({
      where: {
        deleted_at: null
      }
    });
  }
  async findList(page: number, limit: number, search?: string) {
    const where: Prisma.UserWhereInput = search
      ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' }, },
          { name: { contains: search, mode: 'insensitive' } }
        ],
        deleted_at: null
      }
      : { deleted_at: null };
    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit })
    ]);
    return {
      total,
      page: +page,
      limit,
      items
    };
  }
  async update(id: number, data: Partial<RegisterDto>) {
    const now = new Date();
    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updated_at: now
      }
    });
  }
  async delete(id: number) {
    const now = new Date();
    return this.prisma.user.update({
      where: { id },
      data: {
        deleted_at: now
      }
    });
  }
}
