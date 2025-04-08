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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';
import { LoginDto } from 'src/auth/dto/login.dto';
import { User } from 'src/auth/entities/auth.entity';
import { Query as ExpressQuery } from 'express-serve-static-core';
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
}
