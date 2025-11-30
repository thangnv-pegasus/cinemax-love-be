import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FilmHistoryService } from './film-history.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateHistoryDto } from './dto/create-history.dto';

@Controller('film-history')
export class FilmHistoryController {
  constructor(private filmHistoryService: FilmHistoryService) { }

  // cú pháp định nghĩa api lấy danh sách lịch sử xem phim phân trang => /film-history?page=1&limit=12&search=abc
  @Get()
  async getHistory(@Query() query: { page?: number, limit?: number, search?: string }) {
    return this.filmHistoryService.getHistory(query);
  }

  // cú pháp định nghĩa api thống kê lịch sử xem phim theo tháng của năm bất kỳ => /film-history/stitsics
  @Get('stitsics')
  async getMonthlyStats(@Query('year', ParseIntPipe) year: number) {
    return this.filmHistoryService.getMonthlyStats(year);
  }

  // cú pháp định nghĩa api lấy lịch sử xem phim của một người dùng bất kỳ => /film-history/:userId
  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async getHistoryByUserId(@Param('userId', ParseIntPipe) userId: number, @Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 12) {
    return this.filmHistoryService.getByUser(userId, page, limit);
  }

  // cú pháp định nghĩa api tạo lịch sử xem phim
  @Post()
  @UseGuards(JwtAuthGuard)
  async addHistory(@Req() req, @Body() dto: CreateHistoryDto) {
    return this.filmHistoryService.addHistory(req?.user?.id, +dto.episodeId)
  }
}
