import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FilmHistoryService {
  constructor(private prisma: PrismaService) { }
  async getHistory(userId: number, query: { page?: number, limit?: number }) {
    return this.prisma.filmHistory.findMany({
      where: {
        user_id: userId,
      },
      include: {
        episode: {
          include: {
            film: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: ((query.page && query.page > 0 ? query.page : 1) - 1) * (query.limit && query.limit > 0 ? query.limit : 10),
      take: query.limit && query.limit > 0 ? query.limit : 10,
    });
  }

  async addHistory(userId: number, episodeId: number) {
    return this.prisma.filmHistory.create({
      data: {
        episode_id: episodeId,
        user_id: userId
      }
    })
  }
}
