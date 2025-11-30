import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CountryService } from './country.service';

@Controller('countries')
export class CountryController {
  constructor(private countryService: CountryService) {}

  // cú pháp định nghĩa api lấy tất cả các nước => /countries/all
  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getAll() {
    return this.countryService.getAll();
  }

  @Get(':slug/films')
  async getFilmsBySlug(@Param('slug') slug: string, @Query() query: { page?: number, limit?: number }){
    return this.countryService.getFilms(slug, query);
  }
}
