import { MegaService } from '@/mega/mega.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FilmService {
  constructor(private prisma: PrismaService, private mega: MegaService) {}

  async uploadFilmVideo(buffer: Buffer, filename: string): Promise<string> {
    return this.mega.uploadFile(buffer, filename, 'films');
  }
}
