import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './entities/order.entity';
import { Model } from 'mongoose';
import { CreativeProducts } from 'src/cretive-products/entities/cretive-product.entity';
import { User } from 'src/auth/entities/auth.entity';
import { ConfigService } from '@nestjs/config';
import { PaystackService } from './paystack.service';

@Injectable()
export class OrderService {
  @InjectModel(Order.name)
  private OrderModel: Model<Order>;

  @InjectModel(CreativeProducts.name)
  private readonly CreativeProductModel: Model<CreativeProducts>;
  @InjectModel(User.name) private UserModel: Model<User>;

  readonly configService: ConfigService;
  private paystackService: PaystackService;
  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }
  async createOrder(createOrderDTO: CreateOrderDto, userId: string) {
    const { orderItems, billingInfo, redirect_url } = createOrderDTO;
    const user = await this.UserModel.findById(userId);
    if (!user)
      throw new BadRequestException(`User with ID ${userId} not found`);
    let grandTotal = 0;

    // Calculate total price for each item and grandTotal
    for (const item of orderItems) {
      const event = await this.CreativeProductModel.findById(item.eventId);
      if (!event)
        throw new BadRequestException(
          `Event with ID ${item.eventId} not found`,
        );
      item.totalPrice = event.price * item.totalQuantity;
      grandTotal += item.totalPrice;
    }

    // Initialize Paystack Payment
    const paystackResponse = await this.paystackService.initializePayment(
      userId,
      grandTotal,
      redirect_url,
    );
    if (!paystackResponse.data.reference) {
      throw new BadRequestException(
        'Failed to generate Paystack payment reference.',
      );
    }
    // Save order to database
    const newOrder = new this.OrderModel({
      userId,
      orderItems,
      billingInfo,
      grandTotal,
      redirect_url,
      payStackPayment: {
        userId,
        email: user.email,
        billingInfo,
        reference: paystackResponse.data.reference,
        authorization_url: paystackResponse.data.authorization_url,
        access_code: paystackResponse.data.access_code,
        amount: grandTotal,
        transactionStatus: 'pending',
        status: 'notPaid',
        orderItems,
      },
    });

    await newOrder.save();

    return {
      message: 'Order created successfully, complete payment using Paystack',

      reference: paystackResponse.data.reference,
      access_code: paystackResponse.data.access_code,
      authorization_url: paystackResponse.data.authorization_url,
      orderId: newOrder._id,
      orderItems,
      billingInfo,
      redirect_url,
      userId,
      email: user.email,
      amount: grandTotal,
    };
  }
  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
