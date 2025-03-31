import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './entities/order.entity';
import { Model } from 'mongoose';
import { CreativeProducts } from 'src/cretive-products/entities/cretive-product.entity';
import { User } from 'src/auth/entities/auth.entity';
import { ConfigService } from '@nestjs/config';
import { PaystackService } from './paystack.service';
import { PaymentStatus } from './dto/paystack-payment.dto';
import axios, { AxiosResponse } from 'axios';
import { Query } from 'express-serve-static-core';
@Injectable()
export class OrderService {
  private readonly logger = new Logger(PaystackService.name);
  private PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify';
  constructor(
    @InjectModel(Order.name) private OrderModel: Model<Order>,
    @InjectModel(CreativeProducts.name)
    private readonly CreativeProductModel: Model<CreativeProducts>,
    @InjectModel(User.name) private UserModel: Model<User>,
    private readonly configService: ConfigService,
    private readonly paystackService: PaystackService,
  ) {}

  async createOrder(createOrderDTO: CreateOrderDto, userId: string) {
    if (!this.paystackService) {
      throw new Error('PaystackService is not initialized'); // Debugging line
    }
    const { orderItems, billingInfo, redirect_url } = createOrderDTO;

    const user = await this.UserModel.findById(userId);
    if (!user)
      throw new BadRequestException(`User with ID ${userId} not found`);

    let grandTotal = 0;

    for (const item of orderItems) {
      const product = await this.CreativeProductModel.findById(item.productId);
      if (!product)
        throw new BadRequestException(
          `Creative Product with ID ${item.productId} not found`,
        );

      item.totalPrice = product.price * item.totalQuantity;
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
  async verifyPaystackPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.PAYSTACK_VERIFY_URL}/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>(
              'PAYSTACK_SECRET_KEY',
            )}`,
          },
        },
      );

      const data = response.data.data;
      if (data.status !== 'success') {
        throw new BadRequestException('Payment verification failed.');
      }

      // Find order by Paystack reference
      const order = await this.OrderModel.findOne({
        'payStackPayment.reference': reference,
      });

      if (!order) {
        throw new BadRequestException(
          `Order with reference ${reference} not found.`,
        );
      }

      // Update order status
      order.isPaid = true;

      order.payStackPayment.status = PaymentStatus.paid;
      order.payStackPayment.transactionStatus = data.status;
      order.amountPaid = (data.amount / 100).toString(); // Convert from kobo to naira
      order.grandTotal = data.amount / 100;

      await order.save();

      return {
        message: 'Payment verified successfully',
        orderId: order._id,

        reference: order.payStackPayment.reference,
        amountPaid: order.amountPaid,
        status: order.payStackPayment.status,
        redirectUrl: order.payStackPayment.status ? order.redirect_url : null,
      };
    } catch (error) {
      throw new BadRequestException(
        error.response?.data?.message || 'Error verifying payment',
      );
    }
  }

  async findAllOrderPagination(query: Query): Promise<Order[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .populate({
        path: 'orderItems.productId',
        model: 'CreativeProducts',
      })
      .exec();
    return data;
  }

  async findAllApprovedOrderPagination(query: Query): Promise<Order[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.OrderModel.find({ isPaid: true })
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .populate({
        path: 'userId',
        select: '-password',
      })
      .populate({
        path: 'orderItems.productId',
        model: 'CreativeProducts',
      })
      .exec();
    return data;
  }
  async findAllNotApprovedOrderPagination(query: Query): Promise<Order[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.OrderModel.find({ isPaid: false })
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .populate({
        path: 'userId',
        select: '-password',
      })
      .populate({
        path: 'orderItems.productId',
        model: 'CreativeProducts',
      })
      .exec();
    return data;
  }

  findAll() {
    return `This action returns all order`;
  }

  async findOne(id: string) {
    const order = await this.OrderModel.findById(id);
    if (!order) {
      throw new BadRequestException(`Order with ${id} not found`);
    }
    return { order };
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
