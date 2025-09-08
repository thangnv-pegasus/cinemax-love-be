import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { FilmService } from './film/film.service';
import { FilmModule } from './film/film.module';
import { EpisoleService } from './episode/episole.service';
import { EpisoleModule } from './episode/episole.module';
import { EpisodeService } from './episode/episode.service';
import { EpisodeController } from './episode/episode.controller';
import { EpisodeModule } from './episode/episode.module';
import { CategoryService } from './category/category.service';
import { CategoryModule } from './category/category.module';
import { FilmCategoryService } from './film-category/film-category.service';
import { FilmCategoryModule } from './film-category/film-category.module';
import { CountryController } from './country/country.controller';
import { CountryService } from './country/country.service';
import { CountryModule } from './country/country.module';
import { UserModule } from './user/user.module';
import { FilmHistoryController } from './film-history/film-history.controller';
import { FilmHistoryService } from './film-history/film-history.service';
import { FilmHistoryModule } from './film-history/film-history.module';
import { MegaService } from './mega/mega.service';
import { MegaModule } from './mega/mega.module';

@Module({
  imports: [PrismaModule, FilmModule, EpisoleModule, EpisodeModule, CategoryModule, FilmCategoryModule, CountryModule, UserModule, FilmHistoryModule, MegaModule],
  controllers: [AppController, EpisodeController, CountryController, FilmHistoryController],
  providers: [AppService, PrismaService, FilmService, EpisoleService, EpisodeService, CategoryService, FilmCategoryService, CountryService, FilmHistoryService, MegaService],
})
export class AppModule {}
