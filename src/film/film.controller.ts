import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
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

  @Post('upload')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(ROLE.ADMIN)
  @UseInterceptors(FileInterceptor('buffer'))
  async uploadFilmVideo(@Body() body: UploadFilmDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          VALIDATION_FILE_SIZE(5), // 5MB
          VALIDATION_FILE_TYPE('/(jpg|jpeg|png|pdf)$/'), // chỉ cho jpg, png, pdf
        ],
      }),
    )
    file: Express.Multer.File): Promise<string> {
    return this.filmService.uploadFilmVideo(file.buffer, body.filename);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(ROLE.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'poster', maxCount: 1 },
      { name: 'episodes', maxCount: 10 },
    ]),
  )
  async create(@Body() body: CreateFilmDto, @UploadedFiles() files: {
    thumbnail?: Express.Multer.File[];
    poster?: Express.Multer.File[];
    episodes?: Express.Multer.File[];
  },
  ) {
    return this.filmService.create(body, files);
  }

  

  @Get('/find-by-category/:categorySlug')
  async getByCategorySlug(@Param('categorySlug') categorySlug: string, @Query() query: { page?: number, limit?: number }) {
    return this.filmService.findByCategorySlug(categorySlug, query);
  }

  @Get()
  async getAll(@Query('page', ParseIntPipe) page?: number,@Query('limit', ParseIntPipe) limit?: number,@Query('search') search?: string) {
    return this.filmService.findAll({page, limit, search});
  }

  @Get('trending')
  async getTrending(@Query('page', ParseIntPipe) page = 1, @Query('limit', ParseIntPipe) limit = 10) {
    return this.filmService.getTrending(page, limit);
  }

  @Get('suggestion')
  async getSuggestion(@Req() req) {
    return this.filmService.getSuggestion(req?.user?.id);
  }

  @Get('phim-bo')
  async getPhimBo(@Query('page', ParseIntPipe) page: number, @Query('limit', ParseIntPipe) limit: number) {
    return this.filmService.getFilmSeries(page, limit);
  }

  @Get('phim-le')
  async getFilmMovie(@Query('page', ParseIntPipe) page: number, @Query('limit', ParseIntPipe) limit: number) {
    return this.filmService.getFilmSingle(page, limit);
  }

  @Get(':id')
  async getByCategory(@Param('id', ParseIntPipe) id: number) {
    return this.filmService.findById(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.filmService.findBySlug(slug);
  }
}
