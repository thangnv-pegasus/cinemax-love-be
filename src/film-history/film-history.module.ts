import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { FilmHistoryService } from './film-history.service';
import { FilmHistoryController } from './film-history.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FilmHistoryController],
  providers: [FilmHistoryService],
  exports: [FilmHistoryService],
})
export class FilmHistoryModule {}
