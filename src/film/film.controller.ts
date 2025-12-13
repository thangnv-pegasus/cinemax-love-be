import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilmService } from './film.service';
import { UploadFilmDto } from './dto/upload.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/guard/role-guard.guard';
import { Role } from '@/auth/decorators/role.decorator';
import { ROLE } from '@/common/constants/user';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CreateFilmDto } from './dto/create-update.dto';
import { VALIDATION_FILE_SIZE, VALIDATION_FILE_TYPE } from '@/common/helpers/validations';

@Controller('films')
export class FilmController {
  constructor(private filmService: FilmService) { }

  // cú pháp định nghĩa api tạo mới phim => /films
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(ROLE.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'poster', maxCount: 1 },
      { name: 'episodes', maxCount: 10 },
    ],{
      limits: {
        fileSize: 1024 * 1024 * 1024 * 100, // 100GB
      },
    },)
  )
  async create(@Body() body: CreateFilmDto, @UploadedFiles() files: {
    thumbnail?: Express.Multer.File[];
    poster?: Express.Multer.File[];
    episodes?: Express.Multer.File[];
  },
  ) {
    return this.filmService.createWithSupabase(body, files);
  }

  // cú pháp định nghĩa api update phim => /films/:id
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(ROLE.ADMIN)
   @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'poster', maxCount: 1 },
      { name: 'episodes', maxCount: 10 },
    ]),
  )
  async updateFilm(@Param('id', ParseIntPipe) id: number, @Body() payload: Partial<CreateFilmDto>, @UploadedFiles() files: {
    thumbnail?: Express.Multer.File[];
    poster?: Express.Multer.File[];
    episodes?: Express.Multer.File[];
  }) {
    return this.filmService.updateWithSupaBase(id, payload, files);
  }

  // cú pháp định nghĩa api lấy danh sách phim theo thể loại => /films/find-by-category/:categorySlug
  @Get('/find-by-category/:categorySlug')
  async getByCategorySlug(@Param('categorySlug') categorySlug: string, @Query() query: { page?: number, limit?: number }) {
    return this.filmService.findByCategorySlug(categorySlug, query);
  }

  // cú pháp định nghĩa api lấy danh sách phim phân trang (tìm kiếm phim) => /films?page=1&limit=12&search=abc
  @Get('')
  async getAll(@Query('page', ParseIntPipe) page?: number, @Query('limit', ParseIntPipe) limit?: number, @Query('search') search?: string) {
    return this.filmService.findAll({ page, limit, search });
  }

  // cú pháp định nghĩa api lấy danh sách phim trending => /films/trending
  @Get('trending')
  async getTrending(@Query('page', ParseIntPipe) page = 1, @Query('limit', ParseIntPipe) limit = 10) {
    return this.filmService.getTrending(page, limit);
  }

  // cú pháp định nghĩa api gợi ý phim => /films/suggestion
  @Get('suggestion')
  async getSuggestion(@Req() req) {
    return this.filmService.getSuggestion(req?.user?.id);
  }

  // cú pháp định nghĩa api lấy danh sách phim bộ => /films/phim-bo
  @Get('phim-bo')
  async getPhimBo(@Query('page', ParseIntPipe) page: number, @Query('limit', ParseIntPipe) limit: number) {
    return this.filmService.getFilmSeries(page, limit);
  }

  // cú pháp định nghĩa api lấy danh sách phim lẻ => /films/phim-le
  @Get('phim-le')
  async getFilmMovie(@Query('page', ParseIntPipe) page: number, @Query('limit', ParseIntPipe) limit: number) {
    return this.filmService.getFilmSingle(page, limit);
  }

  // cú pháp định nghĩa api lấy thông tin phim theo id => /films/:id
  @Get(':id')
  async getByCategory(@Param('id', ParseIntPipe) id: number) {
    return this.filmService.findById(id);
  }

  // cú pháp định nghĩa api lấy thông tin phim theo slug => /films/slug/:slug
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.filmService.findBySlug(slug);
  }

  // cú pháp định nghĩa api xóa phim => /films/:id
  @Delete(':filmId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(ROLE.ADMIN)
  async deleteFilm(@Param('filmId', ParseIntPipe) filmId: number) {
    return this.filmService.delete(filmId);
  }
}
