import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email
      }
    });
  }

  async validatePassword(plainText: string, hashed: string) {
    // Implement your password validation logic here, e.g., using bcrypt
    return bcrypt.compare(plainText, hashed);
  }
}
