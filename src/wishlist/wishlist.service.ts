import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { GetListWishlistDto } from './dto/list.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async addToWishlist(userId: number, filmId: number) {
    return this.prisma.wishList.create({
      data: {
        user_id: userId,
        film_id: filmId,
      },
    });
  }

  async removeFromWishlist(userId: number, filmId: number) {
    return this.prisma.wishList.deleteMany({
      where: {
        user_id: userId,
        film_id: filmId,
      },
    });
  }

  async getWishlistByUser(userId: number, query?: GetListWishlistDto) {
    const { page = 1, limit = 10, search = '' } = query || {};
    const skip = (page - 1) * limit;
    const where: Prisma.WishListWhereInput = {
      user_id: userId,
      film: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { original_name: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
    };
    const [wishlists, total] = await this.prisma.$transaction([
      this.prisma.wishList.findMany({
        where,
        skip,
        take: limit,
        include: { film: true },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.wishList.count({ where }),
    ]);
    return { data: wishlists, meta: { total, page, limit } };
  }
}
