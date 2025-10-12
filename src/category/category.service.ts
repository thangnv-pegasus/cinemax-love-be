import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService){}

  async getList() {
    return this.prisma.category.findMany({
      where: {
        deleted_at: null
      },
      orderBy: {
        id: 'asc'
      }
    })
  }
}
