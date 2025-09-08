import { Test, TestingModule } from '@nestjs/testing';
import { MegaService } from './mega.service';

describe('MegaService', () => {
  let service: MegaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MegaService],
    }).compile();

    service = module.get<MegaService>(MegaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
