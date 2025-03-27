import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PaystackService } from './paystack.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/entities/auth.entity';
import { Order, OrderSchema } from './entities/order.entity';
import {
  CreativeProducts,
  CreativeProductsSchema,
} from 'src/cretive-products/entities/cretive-product.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: CreativeProducts.name,
        schema: CreativeProductsSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, PaystackService],
})
export class OrderModule {}
