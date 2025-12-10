import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EpisodeCommentService } from './episode-comment.service';
import { CreateCommentDto } from './dto/create.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetListCommentDto } from './dto/list.dto';

@Controller('episode-comment')
@UseGuards(JwtAuthGuard)
export class EpisodeCommentController {
  constructor(private commentService: EpisodeCommentService) {}

  @Get('')
  async getComments(@Query() query: GetListCommentDto) {
    // Implementation for fetching comments can be added here
  }

  @Post('')
  async createComment(@Body() body: CreateCommentDto) {
    return this.commentService.createComment(body);
  } 

  @Patch(':id')
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateCommentDto>,
  ) {
    return this.commentService.updateComment(id, data);
  }

  @Delete(':id')
  async deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.deleteComment(id);
  }
}
