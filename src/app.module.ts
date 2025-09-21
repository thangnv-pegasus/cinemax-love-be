import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FilmModule } from './film/film.module';
import { EpisodeModule } from './episode/episode.module';
import { CategoryModule } from './category/category.module';
import { FilmCategoryModule } from './film-category/film-category.module';
import { CountryModule } from './country/country.module';
import { UserModule } from './user/user.module';
import { FilmHistoryModule } from './film-history/film-history.module';
import { MegaModule } from './mega/mega.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, FilmModule, EpisodeModule, CategoryModule, FilmCategoryModule, CountryModule, UserModule, FilmHistoryModule, MegaModule, AuthModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }
