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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';
import { Order } from './entities/order.entity';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { AddCommentDto } from './dto/AddOrderComment.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AddProjectDescDto } from './dto/projectDescription.dto';
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

  @UseGuards(UserAuthGuard)
  @Get('approved/all/user')
  async getLoginUserAllApprovedOrdersPagination(
    @Query() query: ExpressQuery,
    @Req() req,
  ): Promise<Order[]> {
    const userId = req.userId;
    return this.orderService.findLoginUserAllApprovedOrderPagination(
      query,
      userId,
    );
  }

  @UseGuards(UserAuthGuard)
  @Get('notapproved/all/user')
  async getLoginUserAllNotApprovedOrdersPagination(
    @Query() query: ExpressQuery,
    @Req() req,
  ): Promise<Order[]> {
    const userId = req.userId;
    return this.orderService.findLoginUserAllNotApprovedOrderPagination(
      query,
      userId,
    );
  }
  @Get('pag/all')
  async getAllOrdersPagination(@Query() query: ExpressQuery): Promise<Order[]> {
    return this.orderService.findAllOrderPagination(query);
  }

  @UseGuards(UserAuthGuard)
  @Get('pag/all/user')
  async getAllLoginUserOrderPagination(
    @Query() query: ExpressQuery,
    @Req() req,
  ): Promise<Order[]> {
    const userId = req.userId;
    return this.orderService.findAllLoginUserOrderPagination(query, userId);
  }
  @Get('pag/all/:userId')
  async findAllUserOrderPagination(
    @Query() query: ExpressQuery,
    @Param('userId') userId: string,
  ): Promise<Order[]> {
    return this.orderService.findAllUserOrderPagination(query, userId);
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

  @UseGuards(UserAuthGuard)
  @Patch(':id/comment/new')
  async addComment(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
    @Req() req,
  ) {
    const userId = req.userId;
    return this.orderService.addComment(id, addCommentDto, userId);
  }
  // @UseGuards(UserAuthGuard)
  // @Patch(':id/comment')
  // @UseInterceptors(FileInterceptor('fileUrl'))
  // // @UseInterceptors(FileInterceptor('img'))
  // async addCommentFormData(
  //   @Param('id') id: string,
  //   @Body() addCommentDto: AddCommentDto,
  //   @UploadedFile() file: Express.Multer.File,
  //   @Req() req,
  // ) {
  //   const userId = req.userId;
  //   return this.orderService.addCommentFormData(
  //     id,
  //     addCommentDto,
  //     userId,
  //     file,
  //   );
  // }
  @UseGuards(UserAuthGuard)
  @Patch(':id/comment')
  @UseInterceptors(
    FileInterceptor('fileUrl', {
      limits: { fileSize: 50 * 1024 * 1024 },
      storage: diskStorage({
        destination: './FileUploads',
        filename: (req, file, cb) => {
          const sanitized = file.originalname
            .replace(/\s+/g, '')
            .replace(/[^a-zA-Z0-9.-]/g, '');
          cb(null, `${Date.now()}-${sanitized}`);
        },
      }),
    }),
  )
  async addCommentFormData(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.userId;
    return this.orderService.addCommentFormData(
      id,
      addCommentDto,
      userId,
      file,
    );
  }
  @UseGuards(UserAuthGuard)
  @Patch(':id/project-desc')
  @UseInterceptors(
    FileInterceptor('fileUrl', {
      limits: { fileSize: 50 * 1024 * 1024 },
      storage: diskStorage({
        destination: './FileUploads',
        filename: (req, file, cb) => {
          const sanitized = file.originalname
            .replace(/\s+/g, '')
            .replace(/[^a-zA-Z0-9.-]/g, '');
          cb(null, `${Date.now()}-${sanitized}`);
        },
      }),
    }),
  )
  async addProductDescriptionFormData(
    @Param('id') id: string,
    @Body() addProjectDescDto: AddProjectDescDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.userId;
    return this.orderService.addprojectDescriptionFormData(
      id,
      addProjectDescDto,
      userId,
      file,
    );
  }
}
