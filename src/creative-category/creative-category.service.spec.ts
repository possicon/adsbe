import { Test, TestingModule } from '@nestjs/testing';
import { CreativeCategoryService } from './creative-category.service';

describe('CreativeCategoryService', () => {
  let service: CreativeCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreativeCategoryService],
    }).compile();

    service = module.get<CreativeCategoryService>(CreativeCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
