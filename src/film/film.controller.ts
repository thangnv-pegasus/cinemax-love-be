import { Body, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilmService } from './film.service';
import { UploadFilmDto } from './dto/upload.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/guard/role-guard.guard';
import { Role } from '@/auth/decorators/role.decorator';
import { ROLE } from '@/common/constants/user';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('films')
export class FilmController {
  constructor(private filmService: FilmService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(ROLE.ADMIN)
  @UseInterceptors(FileInterceptor('buffer'))
  async uploadFilmVideo(@Body() body: UploadFilmDto, 
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }), // chỉ cho jpg, png, pdf
        ],
      }),
    )
    file: Express.Multer.File): Promise<string> {
    console.log('body', body, file);
    return this.filmService.uploadFilmVideo(file.buffer, body.filename);
  }
}
