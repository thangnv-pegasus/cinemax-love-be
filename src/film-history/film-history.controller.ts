import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FilmHistoryService } from './film-history.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateHistoryDto } from './dto/create-history.dto';

@Controller('film-history')
export class FilmHistoryController {
  constructor(private filmHistoryService: FilmHistoryService) { }

  @Get()
  async getHistory(@Req() req, @Query() query: { page?: number, limit?: number }) {
    return this.filmHistoryService.getHistory(req?.user?.id, query);
  }

  @Post()
  // @UseGuards(JwtAuthGuard)
  async addHistory(@Req() req, @Body() dto: CreateHistoryDto) {
    return this.filmHistoryService.addHistory(req?.user?.id, +dto.episodeId)
  }
}
