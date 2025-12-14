// import { MegaService } from '@/mega/mega.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateFilmDto } from './dto/create-update.dto';
import slugify from 'slugify';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';
import { FILM_TYPE } from '@/common/constants/film';
import { CountryFilm, Prisma } from '@prisma/client';
import { SupabaseService } from '@/supabase/supabase.service';

@Injectable()
export class FilmService {
  private supabaseService = new SupabaseService()
  constructor(
    private prisma: PrismaService,
    // private mega: MegaService,
    private readonly httpService: HttpService,

  ) { }

  // async uploadFilmVideo(buffer: Buffer, filename: string, folderNamme = 'films'): Promise<string> {
  //   return this.mega.uploadFile(buffer, filename, folderNamme);
  // }

  // async create(
  //   data: CreateFilmDto,
  //   files: {
  //     thumbnail?: Express.Multer.File[];
  //     poster?: Express.Multer.File[];
  //     episodes?: Express.Multer.File[];
  //   }
  // ) {
  //   const film = await this.prisma.$transaction(async (prisma) => {
  //     // ✅ Thumbnail
  //     const thumbnail_url =
  //       files.thumbnail && files.thumbnail[0]?.buffer
  //         ? await this.mega.uploadFile(
  //           files.thumbnail[0].buffer,
  //           files.thumbnail[0].originalname,
  //           'thumbnails'
  //         ).then(res => res)
  //         : typeof data.thumbnail === 'string' && data.thumbnail.trim() !== ''
  //           ? data.thumbnail
  //           : null;

  //     // ✅ Poster
  //     const poster_url =
  //       files.poster && files.poster[0]?.buffer
  //         ? await this.mega.uploadFile(
  //           files.poster[0].buffer,
  //           files.poster[0].originalname,
  //           'posters'
  //         )
  //         : typeof data.poster === 'string' && data.poster.trim() !== ''
  //           ? data.poster
  //           : null;

  //     // ✅ Episodes
  //     const uploadedEpisodeUrls = await Promise.all(
  //       (files.episodes || []).map(async (file) => {
  //         const url = await this.mega.uploadFile(file.buffer, file.originalname, 'films/episodes');
  //         return url;
  //       })
  //     );

  //     const finalEpisodeUrls = [
  //       ...(data.episodes?.filter((ep) => ep.source_type === 'url').map((ep) => ep.source) || []),
  //       ...uploadedEpisodeUrls,
  //     ];

  //     // ✅ Tạo film
  //     const film = await prisma.film.create({
  //       data: {
  //         name: data.name,
  //         description: data.description,
  //         slug: await this.generateSlug(data.name),
  //         poster_url,
  //         thumb_url: thumbnail_url,
  //         original_name: data.original_name,
  //         time: data.time,
  //         total_episodes: finalEpisodeUrls.length,
  //         quality: data.quality,
  //         director: data.director,
  //         casts: data.casts,
  //         type: data.type,
  //       },
  //     });

  //     // ✅ Quan hệ country
  //     await prisma.countryFilm.create({
  //       data: {
  //         film_id: film.id,
  //         country_id: Number(data.country_id),
  //       },
  //     });

  //     // ✅ Quan hệ categories
  //     await prisma.filmCategory.createMany({
  //       data: data.category_ids.map((category_id) => ({
  //         film_id: film.id,
  //         category_id: Number(category_id),
  //       })),
  //     });

  //     // ✅ Tạo tập phim
  //     await prisma.episode.createMany({
  //       data: finalEpisodeUrls.map((url, index) => ({
  //         film_id: film.id,
  //         name: `Tập ${index + 1}`,
  //         url,
  //       })),
  //     });

  //     return film;
  //   }, {
  //     timeout: 200000
  //   });

  //   return film;
  // }

  async createWithSupabase(
    data: CreateFilmDto,
    files: {
      thumbnail?: Express.Multer.File[];
      poster?: Express.Multer.File[];
      episodes?: Express.Multer.File[];
      episodes_files?: Express.Multer.File[];
    }
  ) {
    const film = await this.prisma.$transaction(async (prisma) => {
      // ✅ Thumbnail
      const thumbnail_url =
        files.thumbnail && files.thumbnail[0]?.buffer
          ? await this.supabaseService.uploadImage(
            files.thumbnail[0]
          ).then(res => res.url)
          : typeof data.thumbnail === 'string' && data.thumbnail.trim() !== ''
            ? data.thumbnail
            : null;

      // ✅ Poster
      const poster_url =
        files.poster && files.poster[0]?.buffer
          ? this.supabaseService.uploadImage(
            files.poster[0]
          ).then(res => res.url)
          : typeof data.poster === 'string' && data.poster.trim() !== ''
            ? data.poster
            : null;

      // ✅ Episodes
      const uploadedEpisodeUrls = await Promise.all(
        (files.episodes_files || []).map(async (file) => {
          const url = await this.supabaseService.uploadVideo(file);
          return url;
        })
      );

      const finalEpisodeUrls = [
        ...(data.episodes?.filter((ep) => ep.source_type === 'url').map((ep) => ep.source) || []),
        ...uploadedEpisodeUrls,
      ];

      // ✅ Tạo film
      const film = await prisma.film.create({
        data: {
          name: data.name,
          description: data.description,
          slug: await this.generateSlug(data.name),
          poster_url: await poster_url,
          thumb_url: thumbnail_url,
          original_name: data.original_name,
          time: data.time,
          total_episodes: finalEpisodeUrls.length,
          quality: data.quality,
          director: data.director,
          casts: data.casts,
          type: data.type,
        },
      });

      // ✅ Quan hệ country
      await prisma.countryFilm.create({
        data: {
          film_id: film.id,
          country_id: Number(data.country_id),
        },
      });

      // ✅ Quan hệ categories
      await prisma.filmCategory.createMany({
        data: data.category_ids.map((category_id) => ({
          film_id: film.id,
          category_id: Number(category_id),
        })),
      });

      // ✅ Tạo tập phim
      await prisma.episode.createMany({
        data: finalEpisodeUrls.map((url, index) => ({
          film_id: film.id,
          name: `Tập ${index + 1}`,
          url,
        })),
      });

      return film;
    }, {
      timeout: 200000
    });

    return film;
  }

  // async update(
  //   id: number,
  //   data: Partial<CreateFilmDto>,
  //   files: {
  //     thumbnail?: Express.Multer.File[];
  //     poster?: Express.Multer.File[];
  //     episodes?: Express.Multer.File[];
  //   }
  // ) {
  //   return this.prisma.$transaction(async (prisma) => {
  //     const existingFilm = await prisma.film.findUnique({
  //       where: { id },
  //       include: { episodes: true, filmCategories: true, country_film: true },
  //     });

  //     if (!existingFilm) throw new Error('Film not found');

  //     // ✅ Upload thumbnail (nếu có)
  //     const thumbnail_url =
  //       files?.thumbnail && files.thumbnail[0]?.buffer
  //         ? await this.mega.uploadFile(
  //           files.thumbnail[0].buffer,
  //           files.thumbnail[0].originalname,
  //           'films/thumbnails'
  //         )
  //         : data.thumbnail ?? existingFilm.thumb_url;

  //     const poster_url =
  //       files?.poster && files.poster[0]?.buffer
  //         ? await this.mega.uploadFile(
  //           files.poster[0].buffer,
  //           files.poster[0].originalname,
  //           'films/posters'
  //         )
  //         : data.poster ?? existingFilm.poster_url;

  //     // ✅ Upload/tổng hợp episodes
  //     const uploadedEpisodeUrls = await Promise.all(
  //       (files?.episodes || []).map(async (file) => {
  //         const url = await this.mega.uploadFile(file.buffer, file.originalname, 'films/episodes');
  //         return url;
  //       })
  //     );

  //     const finalEpisodeUrls = [
  //       ...(data.episodes?.filter((ep) => ep.source_type === 'url').map((ep) => ep.source) || []),
  //       ...uploadedEpisodeUrls,
  //     ];

  //     // ✅ Cập nhật film
  //     const updatedFilm = await prisma.film.update({
  //       where: { id },
  //       data: {
  //         name: data.name ?? existingFilm.name,
  //         description: data.description ?? existingFilm.description,
  //         poster_url,
  //         thumb_url: thumbnail_url,
  //         original_name: data.original_name ?? existingFilm.original_name,
  //         time: data.time ?? existingFilm.time,
  //         total_episodes: finalEpisodeUrls.length || existingFilm.total_episodes,
  //         quality: data.quality ?? existingFilm.quality,
  //         director: data.director ?? existingFilm.director,
  //         casts: data.casts ?? existingFilm.casts,
  //         type: Number(data.type) ?? existingFilm.type,
  //       },
  //     });

  //     // ✅ Cập nhật quốc gia (nếu có)
  //     if (data.country_id) {
  //       await prisma.countryFilm.deleteMany({ where: { film_id: id } });
  //       await prisma.countryFilm.create({
  //         data: {
  //           film_id: id,
  //           country_id: Number(data.country_id),
  //         },
  //       });
  //     }

  //     // ✅ Cập nhật categories (nếu có)
  //     if (data.category_ids?.length) {
  //       await prisma.filmCategory.deleteMany({ where: { film_id: id } });
  //       await prisma.filmCategory.createMany({
  //         data: data.category_ids.map((category_id) => ({
  //           film_id: id,
  //           category_id: Number(category_id),
  //         })),
  //       });
  //     }

  //     const existingEpisodes = await prisma.episode.findMany({
  //       where: { film_id: id },
  //     });

  //     const existingUrls = existingEpisodes.map(e => e.url);

  //     // Tập cần thêm mới
  //     const newUrls = finalEpisodeUrls.filter(url => !existingUrls.includes(url));

  //     // Tập cần xóa (nếu có)
  //     const toDelete = existingEpisodes.filter(e => !finalEpisodeUrls.includes(e.url));

  //     if (toDelete.length) {
  //       await prisma.episode.deleteMany({
  //         where: { id: { in: toDelete.map(e => e.id) } },
  //       });
  //     }

  //     if (newUrls.length) {
  //       await prisma.episode.createMany({
  //         data: newUrls.map((url, index) => ({
  //           film_id: id,
  //           name: `Tập ${existingEpisodes.length + index + 1}`,
  //           url,
  //         })),
  //       });
  //     }

  //     return updatedFilm;
  //   });
  // }

  async updateWithSupaBase(
    id: number,
    data: Partial<CreateFilmDto>,
    files: {
      thumbnail?: Express.Multer.File[];
      poster?: Express.Multer.File[];
      // episodes?: Express.Multer.File[];
      episodes_files?: Express.Multer.File[];
    }
  ) {
    console.log('>>> updateWithSupaBase data >>> ', data.episodes);
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const existingFilm = await prisma.film.findUnique({
          where: { id },
          include: { episodes: true, filmCategories: true, country_film: true },
        });

        if (!existingFilm) throw new Error('Film not found');

        // ✅ Upload thumbnail (nếu có)
        const thumbnail_url =
          files.thumbnail && files.thumbnail[0]?.buffer
            ? await this.supabaseService.uploadImage(
              files.thumbnail[0]
            ).then(res => res.url)
            : typeof data.thumbnail === 'string' && data.thumbnail.trim() !== ''
              ? data.thumbnail
              : null;

        // ✅ Poster
        const poster_url =
          files.poster && files.poster[0]?.buffer
            ? this.supabaseService.uploadImage(
              files.poster[0]
            ).then(res => res.url)
            : typeof data.poster === 'string' && data.poster.trim() !== ''
              ? data.poster
              : null;

        console.log('>>> check files >>> ', files?.episodes_files);

        // ✅ Upload/tổng hợp episodes
        const uploadedEpisodeUrls = await Promise.all(
          (files?.episodes_files || []).map(async (file) => {
            const url = await this.supabaseService.uploadVideo(file);
            return url;
          })
        );

        const finalEpisodeUrls = [
          ...(data.episodes?.filter((ep) => ep.source_type === 'url').map((ep) => ep.source) || []),
          ...uploadedEpisodeUrls,
        ];

        console.log('>>> Check final episode urls >>> ', finalEpisodeUrls);

        // ✅ Cập nhật film
        const updatedFilm = await prisma.film.update({
          where: { id },
          data: {
            name: data.name ?? existingFilm.name,
            description: data.description ?? existingFilm.description,
            poster_url: await poster_url,
            thumb_url: thumbnail_url,
            original_name: data.original_name ?? existingFilm.original_name,
            time: data.time ?? existingFilm.time,
            total_episodes: finalEpisodeUrls.length || existingFilm.total_episodes,
            quality: data.quality ?? existingFilm.quality,
            director: data.director ?? existingFilm.director,
            casts: data.casts ?? existingFilm.casts,
            type: Number(data.type) ?? existingFilm.type,
          },
        });

        // ✅ Cập nhật quốc gia (nếu có)
        if (data.country_id) {
          await prisma.countryFilm.deleteMany({ where: { film_id: id } });
          await prisma.countryFilm.create({
            data: {
              film_id: id,
              country_id: Number(data.country_id),
            },
          });
        }

        // ✅ Cập nhật categories (nếu có)
        if (data.category_ids?.length) {
          await prisma.filmCategory.deleteMany({ where: { film_id: id } });
          await prisma.filmCategory.createMany({
            data: data.category_ids.map((category_id) => ({
              film_id: id,
              category_id: Number(category_id),
            })),
          });
        }

        const existingEpisodes = await prisma.episode.findMany({
          where: { film_id: id },
        });

        const existingUrls = existingEpisodes.map(e => e.url);

        // Tập cần thêm mới
        const newUrls = finalEpisodeUrls.filter(url => !existingUrls.includes(url));

        // Tập cần xóa (nếu có)
        const toDelete = existingEpisodes.filter(e => !finalEpisodeUrls.includes(e.url));

        if (toDelete.length) {
          await prisma.episode.deleteMany({
            where: { id: { in: toDelete.map(e => e.id) } },
          });
        }

        console.log('>>> new urls to add >>> ', toDelete);

        if (newUrls.length) {
          console.log('>>> running new url >>> ', newUrls);

          const resCreateEpisode = await this.prisma.episode.createMany({
            data: newUrls.map((url, index) => ({
              film_id: id,
              name: `Tập ${existingEpisodes.length + index + 1}`,
              url,
            })),
          });

          console.log('>>> resCreateEpisode >>> ', resCreateEpisode);
        }
        console.log('>> commit >>> ')
        return updatedFilm;
      });
    } catch (error) {
      console.error('>>> error update film >>> ', error);
      throw error;
    }
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
          deleted_at: null
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
    const filters = [
      { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
      { original_name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
      { director: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
      { casts: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
    ];
    const where = {
      deleted_at: null,
      ...(query.search ? { OR: filters } : {}),
    };
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
      where: { ...whereCondition, deleted_at: null },
      take: 10,
      orderBy: filmOrder,
      include: filmInclude,
    });
  }

  async fetchAndStoreFilms(categorySlug: string, page = 1) {
    const url = `${process.env.PHIM_NGUON_API_URL}/films/the-loai/${categorySlug}?page=${page}`;
    const { data } = await firstValueFrom(this.httpService.get(url, { timeout: 200000 }));

    if (data.status !== 'success' || !Array.isArray(data.items)) {
      throw new Error('API response invalid');
    }

    const categories = await this.prisma.category.findMany()

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
      where: {
        deleted_at: null,
      },
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
      where: {
        deleted_at: null,
      },
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
      where: {
        deleted_at: null,
      },
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

  async delete(filmId: number) {
    return this.prisma.film.update({
      where: {
        id: filmId
      },
      data: {
        deleted_at: new Date()
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

  async fetchFilmByCountryAndSave(page = 1) {
    const countries = await this.prisma.country.findMany({
      select: { id: true, name: true, slug: true },
    });

    for (const country of countries) {
      try {
        const url = `${process.env.PHIM_NGUON_API_URL}/films/quoc-gia/${country.slug}?page=${page}`;

        const { data } = await firstValueFrom(
          this.httpService.get(url, { timeout: 200000 }),
        );

        if (data.status !== 'success' || !Array.isArray(data.items)) {
          console.warn(`⚠️ Invalid response for country: ${country.slug}`);
          continue;
        }

        for (const item of data.items) {
          if (!item.slug) continue;

          const film = await this.prisma.film.findFirst({
            where: { slug: item.slug },
            select: { id: true },
          });

          if (!film) continue;

          const record = await this.prisma.countryFilm.findFirst({
            where: {
              film_id: film.id,
              country_id: country.id,
            },
          });

          if (record) {
            await this.prisma.countryFilm.upsert({
              where: {
                id: record?.id || 0,
              },
              update: {},
              create: {
                film_id: film.id,
                country_id: country.id,
              },
            });
          }else {
            await this.prisma.countryFilm.create({
              data: {
                film_id: film.id,
                country_id: country.id,
              },
            });
          }

          console.log('>>> films >>> ', film, '>>> record >>> ', record);
        }

        console.log(`✅ Imported country: ${country.slug}`);
      } catch (error) {
        console.error(`❌ Failed country ${country.slug}`, error.message);
        continue; // 👉 skip country lỗi
      }
    }

    return { message: 'Data imported successfully' };
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
