import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { CountryController } from './country.controller';

@Module({
  imports: [PrismaModule],
  providers: [CountryService],
  exports: [CountryService],
  controllers: [CountryController]
})
export class CountryModule {}
