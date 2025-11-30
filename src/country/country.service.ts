import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class CountryService {
  constructor(private prisma: PrismaService) { }

  async getAll() {
    return this.prisma.country.findMany(
      {
        where: {
          deleted_at: null
        }
      }
    );
  }

  async getFilms(slug: string, query: { page?: number, limit?: number }) {
    const {page = 1, limit = 12} = query;
    const skip = (page - 1)*limit;

    const where: Prisma.FilmWhereInput = {
      country_film: {
        some: {
          country: {
            slug,
          }
        }
      }
    }
    const [data, total] = await Promise.all([
      this.prisma.film.findMany({
        where,
        include: {
          // country: true,
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
      }), this.prisma.film.count({where})
    ])

    return {
      data,
      meta: {
        page,
        limit,
        last_page: Math.ceil(total / limit),
      }
    }
  }
}
