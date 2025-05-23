import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
  Req,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';
import { LoginDto } from 'src/auth/dto/login.dto';
import { User } from 'src/auth/entities/auth.entity';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { UpdateDeliveryStatusDto } from './dto/UpdateDeliveryStatus.dto';
import { DeliveryCommentDto } from './dto/DeliveryComment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post(':userId/Admin')
  async makeFirstAdminUser(@Param('userId') userId: string) {
    // const objectId = new Types.ObjectId(userId);
    return this.adminService.makeFirstAdminUser(userId);
  }
  @Post('/login')
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.adminService.adminLogin(loginDto);
  }
  @UseGuards(UserAuthGuard)
  @Post(':userId/make-admin')
  async ToggletoMakeUserAdmin(@Param('userId') userId: string, @Req() req) {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }

    return this.adminService.ToggletoMakeUserAdmin(userId);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get('all/admins')
  findAllAdmins(@Query() query: ExpressQuery) {
    return this.adminService.findAllAdmins(query);
  }
  @Get('all/cretive-products/:userId')
  findProductsPostedbyUserId(
    @Param('userId') userId: string,
    @Query() query: ExpressQuery,
  ) {
    return this.adminService.findProductsPostedbyUserId(query, userId);
  }

  @UseGuards(UserAuthGuard)
  @Get('all/cretive-products')
  findProductsPostedbyLoginUser(@Query() query: ExpressQuery, @Req() req) {
    const userId: string = req.userId;
    return this.adminService.findProductsPostedbyLoginUser(query, userId);
  }
  @UseGuards(UserAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateAdminUserDto: UpdateAdminDto,
  ) {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminService.update(id, updateAdminUserDto);
  }

  @UseGuards(UserAuthGuard)
  @Delete(':userId/delete')
  async remove(@Param('userId') id: string, @Req() req) {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    await this.adminService.remove(id);
    return { message: 'Admin User has been removed' };
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.adminService.findById(id);
  }
  ///Admin and user
  /////admin suspend user and soft delete user

  @UseGuards(UserAuthGuard)
  @Delete('delete/user/:userId')
  async AdminRemoveUser(@Param('userId') userId: string, @Req() req) {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    await this.adminService.AdminRemoveUser(userId);
    return { message: ' User has been removed' };
  }
  @UseGuards(UserAuthGuard)
  @Patch(':userId/update/softdelete')
  async softDeleteaUser(
    @Param('userId') userId: string,

    @Req() req,
  ) {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return await this.adminService.softDeleteaUser(userId);
  }

  @UseGuards(UserAuthGuard)
  @Patch(':userId/update/suspend')
  async suspendUser(
    @Param('userId') userId: string,

    @Req() req,
  ) {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return await this.adminService.SuspendaUser(userId);
  }

  @UseGuards(UserAuthGuard)
  @Get('user/all/softdeleted')
  async findAllSoftDeletedUser(
    @Query() query: ExpressQuery,
    @Req() req,
  ): Promise<User[]> {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminService.findAllSoftDeletedUser(query);
  }
  @UseGuards(UserAuthGuard)
  @Get('user/all/unsoftdeleted')
  async findAllUnSoftDeletedUser(
    @Query() query: ExpressQuery,
    @Req() req,
  ): Promise<User[]> {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminService.findAllNotSoftDeletedUser(query);
  }
  @UseGuards(UserAuthGuard)
  @Get('user/all/suspended')
  async findAllSuspendedUserr(
    @Query() query: ExpressQuery,
    @Req() req,
  ): Promise<User[]> {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminService.findAllSuspendedUser(query);
  }
  @UseGuards(UserAuthGuard)
  @Get('user/all/unsuspended')
  async findAllUnSuspendedUserr(
    @Query() query: ExpressQuery,
    @Req() req,
  ): Promise<User[]> {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminService.findAllNotSuspendedUser(query);
  }

  // dashboard metrics
  @UseGuards(UserAuthGuard)
  @Get('dashboard/counts')
  async getCounts(@Req() req) {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminService.countAll();
  }

  @UseGuards(UserAuthGuard)
  @Get('creative-products/analysis/counts')
  async countAllProductAnalysis(@Req() req): Promise<{
    productCount: number;

    totalEarning: number;
    totalOrders: number;
    totalPaidOrders: number;
    totalUnpPaidOrders: number;
    totalCustomers: number;
  }> {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);
    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminService.countAllProductAnalysis();
  }

  @UseGuards(UserAuthGuard)
  @Get('creative-products/:productId/analysis/counts')
  async countProductIdAnalysis(
    @Param('productId') productId: string,
    @Req() req,
  ): Promise<{
    totalEarning: number;
    totalOrders: number;
    totalPaidOrders: number;
    totalUnpPaidOrders: number;
    totalCustomers: number;
  }> {
    const user = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(user);
    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminService.countProductIdAnalysis(productId);
  }

  @UseGuards(UserAuthGuard)
  @Get('creative-products/user/analysis')
  async countAllProductPostedByLoginUserAnalysis(@Req() req): Promise<{
    productCount: number;

    totalEarning: number;
    totalOrders: number;
    totalPaidOrders: number;
    totalUnpPaidOrders: number;
    totalCustomers: number;
  }> {
    const user = req.userId;
    const userId = user;
    const adminAuthority = await this.adminService.getAdminByUserId(user);
    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminService.countAllProductPostedByLoginUserAnalysis(userId);
  }
  @UseGuards(UserAuthGuard)
  @Get('creative-products/user/analysis/:productId')
  async countProductIdPostedbyLoginUserAnalysis(
    @Param('productId') productId: string,
    @Req() req,
  ): Promise<{
    totalEarning: number;
    totalOrders: number;
    totalPaidOrders: number;
    totalUnpPaidOrders: number;
    totalCustomers: number;
  }> {
    const userId = req.userId;
    const adminAuthority = await this.adminService.getAdminByUserId(userId);

    if (!adminAuthority || adminAuthority.userId.toString() !== userId) {
      throw new ForbiddenException('Only admins can perform this action');
    }

    return this.adminService.countProductIdPostedbyLoginUserAnalysis(
      userId,
      productId,
    );
  }

  @UseGuards(UserAuthGuard)
  @Patch(':id/delivery-comment')
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
    @Body() addCommentDto: DeliveryCommentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.userId;
    return this.adminService.addDeliveryCommentFormData(
      id,
      addCommentDto,
      userId,
      file,
    );
  }
  @UseGuards(UserAuthGuard)
  @Patch(':id/delivery-status')
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: UpdateDeliveryStatusDto,
  ) {
    const userId = req.userId;
    return this.adminService.updateDeliveryStatus(id, dto, userId);
  }

  @UseGuards(UserAuthGuard)
  @Patch('new/missing/delivery-statuss')
  async fixMissingDeliveryStatus(@Req() req) {
    const userId = req.userId;
    return await this.adminService.updateOrdersWithMissingDeliveryStatus(
      userId,
    );
  }
}
