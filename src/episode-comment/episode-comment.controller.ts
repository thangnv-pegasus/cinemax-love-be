import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EpisodeCommentService } from './episode-comment.service';
import { CreateCommentDto } from './dto/create.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetListCommentDto } from './dto/list.dto';

@Controller('episode-comment')

export class EpisodeCommentController {
  constructor(private commentService: EpisodeCommentService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getComments(@Query() query: GetListCommentDto) {
    return this.commentService.getComments(query);
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  async createComment(@Body() body: CreateCommentDto) {
    return this.commentService.createComment(body);
  } 

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateCommentDto>,
  ) {
    return this.commentService.updateComment(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.deleteComment(id);
  }

  @Get(':episodeId')
  async getCommentsByEpisode(@Param('episodeId', ParseIntPipe) episodeId: number, @Query() query: GetListCommentDto) {
    return this.commentService.getCommentsByEpisode(episodeId, query);
  }
}
