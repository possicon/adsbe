import { Test, TestingModule } from '@nestjs/testing';
import { CretiveProductsService } from './cretive-products.service';

describe('CretiveProductsService', () => {
  let service: CretiveProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CretiveProductsService],
    }).compile();

    service = module.get<CretiveProductsService>(CretiveProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
