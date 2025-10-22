import { MegaService } from '@/mega/mega.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateFilmDto } from './dto/create-update.dto';
import slugify from 'slugify';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FILM_TYPE } from '@/common/constants/film';

@Injectable()
export class FilmService {
  constructor(private prisma: PrismaService, private mega: MegaService, private readonly httpService: HttpService,) { }

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
          type: data.type,
        }
      });

      const country = await this.prisma.countryFilm.create({
        data: {
          film_id: film.id,
          country_id: data.country_id
        }
      })

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
    return this.prisma.film.findFirst({
      where: { id },
      include: {
        // country: true,
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
        country_film: {
          include: {
            country: true,
          }
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
          // country: true,
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
          country_film: {
            include: {
              country: true,
            }
          }
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
          country_film: {
            include: {
              country: true,
            }
          }
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
      // country: true,
      filmCategories: {
        include: {
          category: true,
        },
      },
      // episodes: {
      //   orderBy: { created_at: 'asc' as const },
      //   take: 1,
      // },
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

  async fetchAndStoreFilms(categorySlug: string, page = 1) {
    const url = `${process.env.PHIM_NGUON_API_URL}/films/the-loai/${categorySlug}?page=${page}`;
    const { data } = await firstValueFrom(this.httpService.get(url, { timeout: 20000 }));

    if (data.status !== 'success' || !Array.isArray(data.items)) {
      throw new Error('API response invalid');
    }

    console.log(">>> data api >>>", data)

    const categories = await this.prisma.category.findMany({})

    for (const item of data.items) {
      const film = await this.prisma.film.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          original_name: item.original_name,
          thumb_url: item.thumb_url,
          poster_url: item.poster_url,
          description: item.description,
          total_episodes: item.total_episodes,
          time: item.time,
          quality: item.quality,
          director: item.director,
          casts: item.casts,
          type: categorySlug === 'phim-le' ? FILM_TYPE.MOVIE : FILM_TYPE.SERIES
        },
        create: {
          slug: item.slug,
          name: item.name,
          original_name: item.original_name,
          thumb_url: item.thumb_url,
          poster_url: item.poster_url,
          description: item.description,
          total_episodes: item.total_episodes,
          time: item.time,
          quality: item.quality,
          director: item.director,
          casts: item.casts,
          type: categorySlug === 'phim-le' ? FILM_TYPE.MOVIE : FILM_TYPE.SERIES
        },
      });
      const categoryTarget = categories.find(item => item.slug === categorySlug);
      if (categoryTarget) {
        await this.prisma.filmCategory.create({
          data: {
            film_id: film.id,
            category_id: categoryTarget.id
          }
        })
      }

      const detailUrl = `${process.env.PHIM_NGUON_API_URL}/film/${item.slug}`;
      const res = await firstValueFrom(this.httpService.get(detailUrl));
      const detailData = res.data

      if (detailData.status === 'success' && detailData.movie?.episodes?.length) {
        const episodes = detailData.movie.episodes.flatMap((server: any) =>
          server.items.map((ep: any) => ({
            film_id: film.id,
            name: ep.name,
            url: ep.embed,
          }))
        );

        await this.prisma.episode.deleteMany({ where: { film_id: film.id } });
        await this.prisma.episode.createMany({ data: episodes });
      }
    }

    return { message: 'Data imported successfully' };
  }

  async getFilmSeries(page = 1, limit = 10) {
    // B1: Lấy tất cả phim có nhiều tập
    const allFilms = await this.prisma.film.findMany({
      include: {
        _count: { select: { episodes: true } },
      },
      orderBy: { id: 'desc' },
    });

    // B2: Lọc phim bộ
    const series = allFilms.filter(f => f._count.episodes > 1);

    // B3: Phân trang thủ công
    const total = series.length;
    const start = (page - 1) * limit;
    const data = series.slice(start, start + limit);

    return {
      data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async getFilmSingle(page = 1, limit = 10) {
    // B1: Lấy toàn bộ phim + đếm số tập
    const allFilms = await this.prisma.film.findMany({
      include: {
        _count: { select: { episodes: true } },
      },
      orderBy: { id: 'desc' },
    });

    // B2: Lọc phim lẻ (chỉ có 1 tập hoặc chưa có tập nào)
    const singles = allFilms.filter(f => f._count.episodes <= 1);

    // B3: Phân trang
    const total = singles.length;
    const start = (page - 1) * limit;
    const data = singles.slice(start, start + limit);

    return {
      data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async getTrending(page = 1, limit = 10) {
    // 1) Lấy tất cả phim (hoặc có thể giới hạn nếu DB rất lớn, xem note)
    const films = await this.prisma.film.findMany({
      include: {
        // lấy episodes và _count lượt xem trên từng episode
        episodes: {
          include: {
            _count: {
              select: { film_histories: true } // ✅ đúng: _count bên trong episode
            }
          }
        },
        // bạn vẫn có thể yêu cầu _count.episodes nếu cần số tập
        _count: {
          select: { episodes: true }
        }
      },
      orderBy: { id: 'desc' } // order lấy ra, sau đó ta sẽ sắp theo totalViews
    });

    // 2) Tính tổng lượt xem cho mỗi phim
    const filmsWithViews = films.map(f => ({
      ...f,
      totalViews: f.episodes.reduce((sum, ep) => sum + (ep._count?.film_histories ?? 0), 0)
    }));

    // 3) Sắp giảm dần theo totalViews
    filmsWithViews.sort((a, b) => b.totalViews - a.totalViews);

    // 4) Phân trang *sau* khi đã sắp
    const total = filmsWithViews.length;
    const start = (page - 1) * limit;
    const data = filmsWithViews.slice(start, start + limit);

    return {
      data,
      meta: {
        total,
        page,
        per_page: limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    return this.prisma.film.findFirst({
      where: {
        slug
      },
      include: {
        country_film: {
          select: {
            country: {
              select: {
                name: true,
                id: true,
                slug: true,
              }
            }
          }
        },
        episodes: true,
        filmCategories: {
          select: {
            id: true,
            category: {
              select: {
                name: true,
                id: true,
                slug: true,
              }
            }
          }
        }
      }
    })
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
