import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { GetListWishlistDto } from './dto/list.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) { }

  async addToWishlist(userId: number, filmId: number) {
    const existingItem = await this.prisma.wishList.findFirst({
      where: {
        user_id: userId,
        film_id: filmId,
      },
    });
    if (existingItem) {
      return existingItem;
    }

    return this.prisma.wishList.create({
      data: {
        user_id: userId,
        film_id: filmId,
      },
    });
  }

  async removeFromWishlist(userId: number, filmId: number) {
    const wishlistItem = await this.prisma.wishList.findFirst({
      where: {
        user_id: userId,
        film_id: filmId,
      },
    });
    if (!wishlistItem) {
      return null;
    }
    return this.prisma.wishList.delete({
      where: {
        id: wishlistItem.id,
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

  async getWishlistFilms(userId: number, query?: GetListWishlistDto) {
    const wishlistIds = await this.prisma.wishList.findMany({
      where: { user_id: userId },
      select: { film_id: true },
    });
    const { page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;
    const filmIds = wishlistIds.map(item => item.film_id);
    const [films, total] = await this.prisma.$transaction([
      this.prisma.film.findMany({
        where: { id: { in: filmIds } },
        skip,
        include: {
          filmCategories: {
            include: {
              category: true,
            },
          },
          episodes: {
            orderBy: {
              created_at: 'asc',
            },
            take: 1,
          },
          country_film: {
            include: {
              country: true,
            }
          }
        },
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.film.count({ where: { id: { in: filmIds } } }),
    ]);
    return { data: films, meta: { total, page, limit } };
  }
}
