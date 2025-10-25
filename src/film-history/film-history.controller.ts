import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FilmHistoryService } from './film-history.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateHistoryDto } from './dto/create-history.dto';

@Controller('film-history')
export class FilmHistoryController {
  constructor(private filmHistoryService: FilmHistoryService) { }

  @Get()
  async getHistory(@Query() query: { page?: number, limit?: number }) {
    return this.filmHistoryService.getHistory(query);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async getHistoryByUserId(@Param('userId', ParseIntPipe) userId: number, @Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 12) {
    return this.filmHistoryService.getByUser(userId, page, limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addHistory(@Req() req, @Body() dto: CreateHistoryDto) {
    return this.filmHistoryService.addHistory(req?.user?.id, +dto.episodeId)
  }
}
