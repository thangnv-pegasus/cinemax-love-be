import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) { }

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

  async listPagination(query: { page?: number, limit?: number, search?: string }) {
    const limit = Number(query?.limit) || 10;
    const page = Number(query?.page) || 1
    const search = query?.search || ''
    const offset = (page - 1) * limit;
    const where: Prisma.CategoryWhereInput = {
      name: {
        contains: search,
        mode: 'insensitive'
      },
      deleted_at: null,
    }

    const [categories, total] = await Promise.all([
      await this.prisma.category.findMany({
        where,
        orderBy: {
          id: 'desc'
        },
        include: {
          _count: { select: { films: true } },
        },
        take: limit,
        skip: offset
      }),
      await this.prisma.category.count({
        where
      })
    ])

    return {
      data: categories,
      meta: {
        page,
        last_page: Math.ceil(total / limit),
        total,
      }
    }
  }

  async update(id: number, payload: Partial<CreateCategoryDto>) {
    return this.prisma.category.update({
      where: {
        id
      },
      data: payload
    })
  }

  async delete(id: number) {
    return this.prisma.category.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date()
      }
    })
  }

  async create(payload: CreateCategoryDto) {
    const categoryExists = await this.prisma.category.findFirst({
      where: {
        slug: slugify(payload.name),
        deleted_at: null,
      }
    })
    console.log(">>> Cehck category >>> ", categoryExists)
    if (!categoryExists) {
      return await this.prisma.category.create({
        data: {
          name: payload.name,
          slug: slugify(payload.name)
        }
      })
    }

    throw new Error('Category does exists!');
  }
}
