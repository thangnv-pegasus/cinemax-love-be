import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CountryService {
  constructor(private prisma: PrismaService) { }

  async getAll() {
    return this.prisma.country.findMany(
      {
        where: {
          deleted_at: null
        }
      }
    );
  }
}
