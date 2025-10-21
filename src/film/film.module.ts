import { Module } from '@nestjs/common';
import { FilmController } from './film.controller';
import { MegaModule } from '@/mega/mega.module';
import { FilmService } from './film.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [MegaModule, HttpModule],
  providers: [FilmService],
  controllers: [FilmController],
  exports: [FilmService]
})
export class FilmModule {}
