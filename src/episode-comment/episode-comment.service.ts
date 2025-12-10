import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { GetListCommentDto } from './dto/list.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EpisodeCommentService {
  constructor(private prisma: PrismaService) {}

  async getComments(query: GetListCommentDto) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.EpisodeCommentWhereInput = search
      ? {
          content: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};
    const [comments, total] = await this.prisma.$transaction([
      this.prisma.episodeComment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.episodeComment.count({ where }),
    ]);
    return { data: comments, meta: { total, page, limit } };
  }

  async createComment(body: CreateCommentDto) {
    return this.prisma.episodeComment.create({
      data: {
        episodeId: body.episodeId,
        content: body.content,
        userId: body.userId,
      },
    });
  }

  async updateComment(id: number, data: Partial<CreateCommentDto>) {
    return this.prisma.episodeComment.update({
      where: { id },
      data: data,
    });
  }

  async deleteComment(id: number) {
    return this.prisma.episodeComment.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
