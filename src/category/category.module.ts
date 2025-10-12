import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CategoryService } from './category.service';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [CategoryService]
})
export class CategoryModule {}
