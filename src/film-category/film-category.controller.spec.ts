import { Test, TestingModule } from '@nestjs/testing';
import { FilmCategoryController } from './film-category.controller';

describe('FilmCategoryController', () => {
  let controller: FilmCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmCategoryController],
    }).compile();

    controller = module.get<FilmCategoryController>(FilmCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
