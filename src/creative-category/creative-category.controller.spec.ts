import { Test, TestingModule } from '@nestjs/testing';
import { CreativeCategoryController } from './creative-category.controller';
import { CreativeCategoryService } from './creative-category.service';

describe('CreativeCategoryController', () => {
  let controller: CreativeCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreativeCategoryController],
      providers: [CreativeCategoryService],
    }).compile();

    controller = module.get<CreativeCategoryController>(CreativeCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
