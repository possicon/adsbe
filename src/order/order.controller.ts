import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';
import { Order } from './entities/order.entity';
import { Query as ExpressQuery } from 'express-serve-static-core';
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(UserAuthGuard)
  @Post('/initialize')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createOrder(@Body() createOrderDTO: CreateOrderDto, @Req() req) {
    const userId = req.userId;
    return this.orderService.createOrder(createOrderDTO, userId);
  }

  @UseGuards(UserAuthGuard)
  @Get('/paystack/verify')
  async verifyPayment(@Query('reference') reference: string) {
    return this.orderService.verifyPaystackPayment(reference);
  }

  @Get('approved/all')
  async getAllApprovedOrdersPagination(
    @Query() query: ExpressQuery,
  ): Promise<Order[]> {
    return this.orderService.findAllApprovedOrderPagination(query);
  }
  @Get('notapproved/all')
  async getAllNotApprovedOrdersPagination(
    @Query() query: ExpressQuery,
  ): Promise<Order[]> {
    return this.orderService.findAllNotApprovedOrderPagination(query);
  }

  @Get('pag/all')
  async getAllOrdersPagination(@Query() query: ExpressQuery): Promise<Order[]> {
    return this.orderService.findAllOrderPagination(query);
  }
  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
