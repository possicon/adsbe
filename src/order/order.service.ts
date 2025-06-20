import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import { AddCommentDto } from './dto/AddOrderComment.dto';
import { AdminUser } from 'src/admin/entities/admin.entity';
const ImageKit = require('imagekit');
import * as fs from 'fs';
import { MailService } from './Services/mail.service';
import { AddProjectDescDto } from './dto/projectDescription.dto';
@Injectable()
export class OrderService {
  private readonly logger = new Logger(PaystackService.name);
  private PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify';
  private imagekit: ImageKit;
  constructor(
    @InjectModel(Order.name) private OrderModel: Model<Order>,
    @InjectModel(AdminUser.name)
    private readonly AdminUserModel: Model<AdminUser>,
    @InjectModel(CreativeProducts.name)
    private readonly CreativeProductModel: Model<CreativeProducts>,
    @InjectModel(User.name) private UserModel: Model<User>,
    private readonly configService: ConfigService,
    private readonly paystackService: PaystackService,
    private mailService: MailService,
  ) {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  async createOrder(createOrderDTO: CreateOrderDto, userId: string) {
    if (!this.paystackService) {
      throw new Error('PaystackService is not initialized'); // Debugging line
    }
    const {
      orderItems,
      // billingInfo,
      redirect_url,
      projectDsc,
    } = createOrderDTO;

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
      // billingInfo,
      grandTotal,
      redirect_url,
      projectDsc,
      payStackPayment: {
        userId,
        email: user.email,
        // billingInfo,
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
    const email = user.email;
    const firstName = user.firstName;
    const lastName = user.lastName;
    const amount = grandTotal;
    const reference = paystackResponse.data.reference;

    try {
      await this.mailService.ConfirmOrder(
        email,
        firstName,
        lastName,
        amount,
        reference,
      );
    } catch (error) {
      throw new Error(`Failed to send email to ${email}`);
    }

    return {
      message: 'Order created successfully, complete payment using Paystack',
      reference: paystackResponse.data.reference,
      access_code: paystackResponse.data.access_code,
      authorization_url: paystackResponse.data.authorization_url,
      orderId: newOrder._id,
      orderItems,
      // billingInfo,
      redirect_url,
      projectDsc,
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
            Authorization: `Bearer ${this.configService.get<string>('PAYSTACK_SECRET_KEY')}`,
          },
        },
      );

      const data = response.data.data;
      if (data.status !== 'success') {
        throw new BadRequestException('Payment verification failed.');
      }

      const order = await this.OrderModel.findOne({
        'payStackPayment.reference': reference,
      });
      if (!order)
        throw new BadRequestException(
          `Order with reference ${reference} not found.`,
        );

      const user = await this.UserModel.findById(order.userId);
      if (!user)
        throw new BadRequestException(`User with ID ${order.userId} not found`);

      // Update payment details
      order.isPaid = true;
      order.payStackPayment.status = PaymentStatus.paid;
      order.payStackPayment.transactionStatus = data.status;
      order.amountPaid = (data.amount / 100).toString();
      order.grandTotal = data.amount / 100;
      await order.save();

      const email = user.email;
      const firstName = user.firstName;
      const lastName = user.lastName;
      const amount: any = order.grandTotal;
      const referencePay = reference;
      const trans_status = data.status;
      try {
        await this.mailService.VerifyOrder(
          email,
          firstName,
          lastName,
          amount,
          referencePay,
          trans_status,
        );
      } catch (error) {
        throw new Error(`Failed to send email to ${email}`);
      }
      // Fetch detailed order items
      const orderDetails: any = await this.OrderModel.findById(order._id)
        .populate({ path: 'orderItems.productId', model: 'CreativeProducts' })
        .populate({ path: 'userId', select: '-password' })
        .exec();

      // Send Invoice
      try {
        await this.mailService.Invoice(
          user.email,
          user.firstName,
          user.lastName,
          order.grandTotal,
          reference,
          data.status,
          orderDetails.orderItems,
          orderDetails.createdAt,
        );
        console.log('mail order oderDetails', orderDetails.orderItems);
      } catch (error) {
        throw new Error(`Failed to send invoice email to ${user.email}`);
      }

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
        error.response?.data?.message ||
          'Error verifying payment, User did not complete transaction',
      );
    }
  }

  async verifyPaystackPaymentWithoutMailInvoice(reference: string) {
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
      const user = await this.UserModel.findById(order.userId);
      if (!user)
        throw new BadRequestException(`User with ID ${order.userId} not found`);
      // Update order status
      order.isPaid = true;

      order.payStackPayment.status = PaymentStatus.paid;
      order.payStackPayment.transactionStatus = data.status;
      order.amountPaid = (data.amount / 100).toString(); // Convert from kobo to naira
      order.grandTotal = data.amount / 100;

      await order.save();
      const email = user.email;
      const firstName = user.firstName;
      const lastName = user.lastName;
      const amount: any = order.grandTotal;
      const referencePay = reference;
      const trans_status = data.status;
      try {
        await this.mailService.VerifyOrder(
          email,
          firstName,
          lastName,
          amount,
          referencePay,
          trans_status,
        );
      } catch (error) {
        throw new Error(`Failed to send email to ${email}`);
      }
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
        error.response?.data?.message ||
          'Error verifying payment, User didnt not complete transaction',
      );
    }
  }
  async findOrderDetails(id: string) {
    const order = await this.OrderModel.findById(id)
      .populate({
        path: 'orderItems.productId',
        model: 'CreativeProducts',
      })
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })

      .exec();
    if (!order) {
      throw new BadRequestException(`Order with ${id} not found`);
    }
    return { order };
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
  async findLoginUserAllApprovedOrderPagination(
    query: Query,
    userId: string,
  ): Promise<Order[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.OrderModel.find({ userId, isPaid: true })
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
  async findLoginUserAllNotApprovedOrderPagination(
    query: Query,
    userId: string,
  ): Promise<Order[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.OrderModel.find({ userId, isPaid: false })
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
  async findAllLoginUserOrderPagination(
    query: Query,
    userId: string,
  ): Promise<Order[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.OrderModel.find({ userId })
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
    if (!data) {
      throw new BadRequestException('No Order found for this user');
    }
    return data;
  }

  async findAllUserOrderPagination(
    query: Query,
    userId: string,
  ): Promise<Order[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.OrderModel.find({ userId })
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
  findAll() {
    return `This action returns all order`;
  }

  async findOne(id: string) {
    const order = await this.OrderModel.findById(id)
      .populate({
        path: 'orderItems.productId',
        model: 'CreativeProducts',
      })
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })

      .exec();
    if (!order) {
      throw new BadRequestException(`Order with ${id} not found`);
    }
    return { order };
  }

  async addComment(id: string, addCommentDto: AddCommentDto, userId: string) {
    const addComment = await this.OrderModel.findById(id);
    if (!addComment) {
      throw new NotFoundException('Order not found');
    }

    const customer = await this.OrderModel.findOne({ userId });
    const adminUser = await this.AdminUserModel.findOne({ userId });
    if (!customer && !adminUser) {
      throw new NotFoundException(
        'Only Admin & Customer for the order is permitted to add a comment',
      );
    }
    let PicsUrl: string | undefined;

    if (addCommentDto.fileUrl) {
      try {
        const img = await this.imagekit.upload({
          file: addCommentDto.fileUrl,
          // fileName: `${addCommentDto.commentText}/order/.jpg`,
          fileName: 'orderComment.jpg',
          folder: '/Order',
        });

        PicsUrl = img.url;
        addCommentDto.fileUrl = PicsUrl;
      } catch (error) {
        console.error('Error uploading to ImageKit:', error);
        throw new BadRequestException('Error uploading order picture');
      }
    }
    const newComment: any = {
      userId: userId,
      commentText: addCommentDto.commentText,
      fileUrl: addCommentDto.fileUrl,
      createdAt: new Date(),
    };

    addComment.comments.push(newComment);
    return await addComment.save();
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async addCommentFormData(
    id: string,
    addCommentDto: AddCommentDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const addComment = await this.OrderModel.findById(id);
    if (!addComment) {
      throw new NotFoundException('Order not found');
    }

    const customer = await this.OrderModel.findOne({ userId });
    const adminUser = await this.AdminUserModel.findOne({ userId });
    if (!customer && !adminUser) {
      throw new NotFoundException(
        'Only Admin & Customer for the order is permitted to add a comment',
      );
    }
    let imageUrl: string | undefined;
    if (file) {
      try {
        const filePath = `${process.env.Base_Url || process.env.Base_Url_Local}/uploads/${file.filename}`;
        // PicsUrl.push(filePath);
        imageUrl = filePath;
        addCommentDto.fileUrl = imageUrl;
      } catch (error) {
        console.error('File Save Error:', error);
        throw new BadRequestException('Error saving file(s)');
      }
    }

    const newComment: any = {
      userId: userId,
      commentText: addCommentDto.commentText,
      fileUrl: addCommentDto.fileUrl,
      createdAt: new Date(),
    };

    addComment.comments.push(newComment);
    return await addComment.save();
  }
  async addCommentFormDataCLOUD(
    id: string,
    addCommentDto: AddCommentDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const addComment = await this.OrderModel.findById(id);
    if (!addComment) {
      throw new NotFoundException('Order not found');
    }

    const customer = await this.OrderModel.findOne({ userId });
    const adminUser = await this.AdminUserModel.findOne({ userId });
    if (!customer && !adminUser) {
      throw new NotFoundException(
        'Only Admin & Customer for the order is permitted to add a comment',
      );
    }

    let imgUrl: string | undefined;
    if (file) {
      try {
        const base64Image = file.buffer.toString('base64');
        const mimeType = file.mimetype;

        // Extract extension from original file name
        const ext = file.originalname.split('.').pop(); // e.g., 'jpg', 'png'
        const fileName = `orderComment_${Date.now()}.${ext}`; // Optional: Add timestamp to avoid name conflicts

        const dataUri = `data:${mimeType};base64,${base64Image}`;

        const upload = await this.imagekit.upload({
          file: dataUri,
          fileName: fileName,
          folder: '/Order',
        });

        imgUrl = upload.url;
      } catch (error) {
        console.error('ImageKit Upload Error:', error);
        throw new BadRequestException('Error uploading order picture');
      }
    }

    const newComment: any = {
      userId: userId,
      commentText: addCommentDto.commentText,
      fileUrl: imgUrl,
      createdAt: new Date(),
    };

    addComment.comments.push(newComment);
    return await addComment.save();
  }

  async addprojectDescriptionFormData(
    id: string,
    addProjectDescDto: AddProjectDescDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const addComment = await this.OrderModel.findById(id);
    if (!addComment) {
      throw new NotFoundException('Order not found');
    }

    const customer = await this.OrderModel.findOne({ userId });

    if (!customer) {
      throw new NotFoundException(
        'Only Customer for the order is permitted to add a project description',
      );
    }
    let imageUrl: string | undefined;
    if (file) {
      try {
        const filePath = `${process.env.Base_Url || process.env.Base_Url_Local}/uploads/${file.filename}`;
        // PicsUrl.push(filePath);
        imageUrl = filePath;
        addProjectDescDto.fileUrl = imageUrl;
      } catch (error) {
        console.error('File Save Error:', error);
        throw new BadRequestException('Error saving file(s)');
      }
    }

    const newComment: any = {
      userId: userId,
      desc: addProjectDescDto.desc,
      fileUrl: addProjectDescDto.fileUrl,
      createdAt: new Date(),
    };

    addComment.projectDesc.push(newComment);
    return await addComment.save();
  }
}
