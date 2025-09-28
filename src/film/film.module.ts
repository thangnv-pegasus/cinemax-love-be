import { Module } from '@nestjs/common';
import { FilmController } from './film.controller';
import { MegaModule } from '@/mega/mega.module';
import { FilmService } from './film.service';

@Module({
  imports: [MegaModule],
  providers: [FilmService],
  controllers: [FilmController]
})
export class FilmModule {}
