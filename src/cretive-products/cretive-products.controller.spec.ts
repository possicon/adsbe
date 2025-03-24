import { Test, TestingModule } from '@nestjs/testing';
import { CretiveProductsController } from './cretive-products.controller';
import { CretiveProductsService } from './cretive-products.service';

describe('CretiveProductsController', () => {
  let controller: CretiveProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CretiveProductsController],
      providers: [CretiveProductsService],
    }).compile();

    controller = module.get<CretiveProductsController>(CretiveProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
