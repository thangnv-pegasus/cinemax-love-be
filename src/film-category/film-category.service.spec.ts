import { Test, TestingModule } from '@nestjs/testing';
import { FilmCategoryService } from './film-category.service';

describe('FilmCategoryService', () => {
  let service: FilmCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilmCategoryService],
    }).compile();

    service = module.get<FilmCategoryService>(FilmCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
