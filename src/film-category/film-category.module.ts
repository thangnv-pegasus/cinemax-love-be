import { Module } from '@nestjs/common';
import { FilmCategoryController } from './film-category.controller';

@Module({
  controllers: [FilmCategoryController]
})
export class FilmCategoryModule {}
