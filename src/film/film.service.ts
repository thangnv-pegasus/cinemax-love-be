import { MegaService } from '@/mega/mega.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateFilmDto } from './dto/create-update.dto';
import slugify from 'slugify';

@Injectable()
export class FilmService {
  constructor(private prisma: PrismaService, private mega: MegaService) { }

  async uploadFilmVideo(buffer: Buffer, filename: string, folderNamme = 'films'): Promise<string> {
    return this.mega.uploadFile(buffer, filename, folderNamme);
  }

  async create(data: CreateFilmDto, files: {
    thumbnail?: Express.Multer.File[];
    poster?: Express.Multer.File[];
    episodes?: Express.Multer.File[];
  }) {
    const film = await this.prisma.$transaction(async (prisma) => {
      const thumbnail_url = files.thumbnail && files.thumbnail[0].buffer
        ? await this.mega.uploadFile(files.thumbnail[0].buffer, files.thumbnail[0].originalname, 'films/thumnails')
        : null;
      const poster_url = files.poster && files.poster[0].buffer
        ? await this.mega.uploadFile(files.poster[0].buffer, files.poster[0].originalname, 'films/posters')
        : null;
      const episodes = await Promise.all(
        (files.episodes || []).map(async (file) => {
          const url = await this.mega.uploadFile(file.buffer, file.originalname);
          return url;
        }),
      );

      const film = await prisma.film.create({
        data: {
          name: data.name,
          description: data.description,
          slug: await this.generateSlug(data.name),
          poster_url,
          thumb_url: thumbnail_url,
          original_name: data.original_name,
          time: data.time,
          total_episodes: episodes.length,
          quality: data.quality,
          director: data.director,
          casts: data.casts,
          country_id: data.country_id,
          type: data.type,
        }
      });

      await prisma.filmCategory.createMany({
        data: data.category_ids.map((category_id) => ({
          film_id: film.id,
          category_id,
        })),
      });

      await prisma.episode.createMany({
        data: episodes.map((url, index) => ({
          film_id: film.id,
          name: `Tập ${index + 1}`,
          url,
        })),
      });

      return film;
    }, {
      maxWait: 20000,   // chờ tối đa 20s để bắt đầu transaction
      timeout: 60000,   // cho phép transaction tồn tại tối đa 60s
    });

    return film;
  }

  async findById(id: number) {
    return this.prisma.film.findUnique({
      where: { id },
      include: {
        country: true,
        filmCategories: {
          include: {
            category: true,
          },
        },
        episodes: {
          orderBy: {
            created_at: 'asc',
          },
          take: 1,
        },
      },
    });
  }

  async findByCategorySlug(categorySlug: string, query: { page?: number, limit?: number }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const offset = (page - 1) * limit;
    const [films, total] = await this.prisma.$transaction([
      this.prisma.film.findMany({
        where: {
          filmCategories: {
            some: {
              category: {
                slug: categorySlug,
              },
            },
          },
        },
        include: {
          country: true,
          filmCategories: {
            include: {
              category: true,
            },
          },
          episodes: {
            orderBy: {
              created_at: 'asc',
            },
            take: 1,
          },
        },
        skip: offset,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.film.count({
        where: {
          filmCategories: {
            some: {
              category: {

                slug: categorySlug,
              },
            },
          },
        },
      }),
    ]);
    return {
      data: films,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findAll(query: { page?: number, limit?: number, search?: string }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const offset = (page - 1) * limit;
    const where = query.search ? {
      OR: [
        { name: { contains: query.search } },
        { original_name: { contains: query.search } },
        { director: { contains: query.search } },
        { casts: { contains: query.search } },
      ],
    } : {};
    const [films, total] = await this.prisma.$transaction([
      this.prisma.film.findMany({
        where,
        include: {
          country: true,
          filmCategories: {
            include: {
              category: true,
            },
          },
          episodes: {
            orderBy: {
              created_at: 'asc',
            },
            take: 1,
          },
        },
        skip: offset,

        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.film.count({ where }),
    ]);
    return {
      data: films,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async getSuggestion(user_id?: number) {
    // Define shared include & orderBy config
    const filmInclude = {
      country: true,
      filmCategories: {
        include: {
          category: true,
        },
      },
      episodes: {
        orderBy: { created_at: 'asc' as const },
        take: 1,
      },
    };
    const filmOrder = { created_at: 'desc' as const };
    // Default query condition (nếu không có user hoặc không có gợi ý)
    let whereCondition: any = {};

    if (user_id) {
      // Lấy top 3 category người dùng hay xem nhất
      const categoriesSuggest = await this.getTop3CategoriesByUser(user_id);
      const categoryIds = categoriesSuggest.map((c) => c.categoryId);

      if (categoryIds.length > 0) {
        whereCondition = {
          filmCategories: {
            some: {
              category_id: { in: categoryIds },
            },
          },
        };
      }
    }

    // Query chung
    return this.prisma.film.findMany({
      where: whereCondition,
      take: 10,
      orderBy: filmOrder,
      include: filmInclude,
    });
  }


  private async generateSlug(name: string): Promise<string> {
    let slug = slugify(name, {
      lower: true,
      strict: true,
      locale: 'vi',
    });
    const checkSlugExists = await this.prisma.film.findUnique({ where: { slug } });
    if (checkSlugExists) {
      const timestamp = Date.now();
      slug = `${slug}-${timestamp}`;
    }

    return slug;
  }

  private async getTop3CategoriesByUser(userId: number) {
    return this.prisma.$queryRawUnsafe<
      { categoryId: number; name: string; count: number }[]
    >(`
    SELECT c.id AS "categoryId", c.name, c.slug, COUNT(*) AS count
    FROM film_histories fh
    JOIN films f ON fh.film_id = f.id
    JOIN categories c ON f.category_id = c.id
    WHERE fh.user_id = ${userId}
    GROUP BY c.id, c.name
    ORDER BY count DESC
    LIMIT 3;
  `);
  }
}
