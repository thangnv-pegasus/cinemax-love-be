import { Module } from '@nestjs/common';
import { EpisodeCommentController } from './episode-comment.controller';
import { EpisodeCommentService } from './episode-comment.service';

@Module({
  controllers: [EpisodeCommentController],
  providers: [EpisodeCommentService],
  exports: [EpisodeCommentService],
})
export class EpisodeCommentModule {}
