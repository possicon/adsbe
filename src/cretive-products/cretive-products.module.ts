import { Module } from '@nestjs/common';
import { CretiveProductsService } from './cretive-products.service';
import { CretiveProductsController } from './cretive-products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CreativeProducts,
  CreativeProductsSchema,
} from './entities/cretive-product.entity';
import { AdminUser, AdminUserSchema } from 'src/admin/entities/admin.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CreativeProducts.name,
        schema: CreativeProductsSchema,
      },
      {
        name: AdminUser.name,
        schema: AdminUserSchema,
      },
    ]),
  ],
  controllers: [CretiveProductsController],
  providers: [CretiveProductsService],
})
export class CretiveProductsModule {}
