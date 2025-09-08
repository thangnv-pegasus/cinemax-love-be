import { Test, TestingModule } from '@nestjs/testing';
import { FilmHistoryController } from './film-history.controller';

describe('FilmHistoryController', () => {
  let controller: FilmHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmHistoryController],
    }).compile();

    controller = module.get<FilmHistoryController>(FilmHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
