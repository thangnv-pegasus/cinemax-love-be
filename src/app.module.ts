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
import { CommandRunnerModule } from 'nest-commander';
import { FetchFilmsCommand } from './commands/seed-film';
import { SupabaseModule } from './supabase/supabase.module';
import { EpisodeCommentService } from './episode-comment/episode-comment.service';
import { EpisodeCommentModule } from './episode-comment/episode-comment.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [PrismaModule,
    FilmModule,
    EpisodeModule,
    CategoryModule,
    FilmCategoryModule,
    CountryModule,
    UserModule,
    FilmHistoryModule,
    // MegaModule,
    AuthModule,
    CommandRunnerModule,
    SupabaseModule,
    EpisodeCommentModule,
    WishlistModule
  ],
  controllers: [],
  providers: [AppService, FetchFilmsCommand, EpisodeCommentService],
})
export class AppModule { }
