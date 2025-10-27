import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FilmHistoryService {
  constructor(private prisma: PrismaService) { }
  async getHistory(query: { page?: number, limit?: number, search?: string }) {
    const page = query.page && query.page > 0 ? +query.page : 1;
    const limit = query.limit && query.limit > 0 ? +query.limit : 10;
    const offset = (page - 1) * limit;
    const where = query.search ? {
      OR: [
        {
          user: {
            name: {
              contains: query.search
            }
          }
        },
        {
          episode: {
            film: {
              name: {
                contains: query.search
              }
            }
          }
        }
      ],
    } : {};
    const [filmHistories, total] = await this.prisma.$transaction([
      this.prisma.filmHistory.findMany({
        where,
        include: {
          episode: {
            include: {
              film: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              email: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.filmHistory.count({
        where
      }),
    ])

    return {
      data: filmHistories,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async getByUser(userId, page = 1, limit = 12) {
    const offset = (page - 1) * limit;
    const [filmHistories, total] = await this.prisma.$transaction([
      this.prisma.filmHistory.findMany({
        where: {
          user_id: userId,
        },
        include: {
          episode: {
            select: {
              name: true,
              film: true,
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.filmHistory.count({ where: { user_id: userId } }),
    ]);

    return {
      data: filmHistories,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async addHistory(userId: number, episodeId: number) {
    const existing = await this.prisma.filmHistory.findFirst({
      where: { user_id: userId, episode_id: episodeId },
    });

    if (existing) return existing; // đã có -> trả về luôn

    return this.prisma.filmHistory.create({
      data: { user_id: userId, episode_id: episodeId },
    });
  }

}
