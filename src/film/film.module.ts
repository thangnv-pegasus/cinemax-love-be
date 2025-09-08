import { Module } from '@nestjs/common';
import { FilmController } from './film.controller';

@Module({
  controllers: [FilmController]
})
export class FilmModule {}
