import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { GetListCommentDto } from './dto/list.dto';
import { Prisma } from '@prisma/client';
import { COMMENT_STATUS } from './constants';

@Injectable()
export class EpisodeCommentService {
  constructor(private prisma: PrismaService) { }

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
        where: {
          ...where,
          deleted_at: null,
        },
        skip,
        include: {
          user: true, 
          episode: {
            select: {
              id: true,
              name: true,
              film: true,
            }
          }
        },
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.episodeComment.count({ where }),
    ]);
    return { items: comments, meta: { total, page, limit } };
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

  async getCommentsByEpisode(episodeId: number, query: GetListCommentDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.EpisodeCommentWhereInput = {
      episodeId: episodeId,
      status: COMMENT_STATUS.VISIBLE,
      deleted_at: null,
    };
    const [comments, total] = await this.prisma.$transaction([
      this.prisma.episodeComment.findMany({
        where,
        include: { user: true },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.episodeComment.count({ where }),
    ]);
    return { data: comments, meta: { total, page, limit } };
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
