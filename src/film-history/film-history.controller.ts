import { Controller, Get, Query, Req } from '@nestjs/common';
import { FilmHistoryService } from './film-history.service';

@Controller('film-history')
export class FilmHistoryController {
  constructor(private filmHistoryService: FilmHistoryService) { }

  @Get()
  async getHistory(@Req() req, @Query() query: { page?: number, limit?: number }) {
    return this.filmHistoryService.getHistory(req?.user?.id, query);
  }
}
