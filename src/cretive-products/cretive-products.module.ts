import { Module } from '@nestjs/common';
import { CretiveProductsService } from './cretive-products.service';
import { CretiveProductsController } from './cretive-products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CreativeProducts,
  CreativeProductsSchema,
} from './entities/cretive-product.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CreativeProducts.name,
        schema: CreativeProductsSchema,
      },
    ]),
  ],
  controllers: [CretiveProductsController],
  providers: [CretiveProductsService],
})
export class CretiveProductsModule {}
