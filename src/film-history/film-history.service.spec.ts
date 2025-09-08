import { Test, TestingModule } from '@nestjs/testing';
import { FilmHistoryService } from './film-history.service';

describe('FilmHistoryService', () => {
  let service: FilmHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilmHistoryService],
    }).compile();

    service = module.get<FilmHistoryService>(FilmHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
