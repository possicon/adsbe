import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Model, Types, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AdminUser } from './entities/admin.entity';

import { Query } from 'express-serve-static-core';

import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RefreshToken } from 'src/auth/entities/refresh-token.schema';
import * as bcrypt from 'bcrypt';
import { User } from 'src/auth/entities/auth.entity';
import { CreativeProducts } from 'src/cretive-products/entities/cretive-product.entity';
import { Order } from 'src/order/entities/order.entity';
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(AdminUser.name)
    private readonly AdminUserModel: Model<AdminUser>,
    @InjectModel(CreativeProducts.name)
    private CreativeProductsModel: Model<CreativeProducts>,
    @InjectModel(Order.name) private OrderModel: Model<Order>,
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
  ) {}
  async makeFirstAdminUser(
    // userId: Types.ObjectId
    userId: string,
  ): Promise<AdminUser> {
    const userAlreadyAdmin = await this.AdminUserModel.findOne({
      userId,
    });
    if (userAlreadyAdmin) {
      throw new BadRequestException('This User is already an admin ');
    }
    const adminUser = new this.AdminUserModel({
      userId: userId,
      isAdmin: true,
    });

    return adminUser.save();
  }

  async adminLogin(credentials: LoginDto) {
    const { email, password } = credentials;

    // Find the user by email
    const user: any = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User Not found');
    }

    // Check if the user is an admin

    const admin: any = await this.AdminUserModel.findOne({
      userId: user._id.toString(),
      isAdmin: true,
    });
    if (!admin || !admin.isAdmin) {
      throw new UnauthorizedException('Access denied. Admin only');
    }
    console.log(admin);
    // Validate password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Password mismatch');
    }

    // Generate JWT token
    const payload = { userId: user._id, isAdmin: true, roles: admin.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: admin.role,
      isAdmin: admin.isAdmin,
    };
  }
  async generateUserTokens(userId: any) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '10h' });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }
  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }
  async findById(id: string): Promise<AdminUser> {
    const category = await this.AdminUserModel.findById(id)
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
    if (!category) {
      throw new NotFoundException('Admin User not found');
    }
    return category;
  }
  async findAdminByUserId(userId: string): Promise<AdminUser> {
    const adminUser = await this.AdminUserModel.findOne({
      userId,
      isAdmin: true,
    }).exec();

    if (!adminUser) {
      throw new NotFoundException('Admin User not found');
    }

    return adminUser;
  }

  async findAll(): Promise<AdminUser[]> {
    return this.AdminUserModel.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
  }
  async findAllAdmins(query: Query): Promise<any> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.AdminUserModel.find({ isAdmin: true })
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: '-password',
      })

      .limit(resPerPage)
      .skip(skip)

      .exec();

    return data;
  }

  async findByUserId(userId: string): Promise<AdminUser> {
    const adminUser = await this.AdminUserModel.findOne({ userId }).exec();

    if (!adminUser) {
      throw new NotFoundException('Admin User not found');
    }

    return adminUser;
  }
  async getAdminByUserId(userId: string): Promise<AdminUser> {
    const adminuser = await this.AdminUserModel.findOne({
      userId,
      isAdmin: true,
    }).exec();
    if (!adminuser) {
      throw new NotFoundException('Only admins can perform this action');
    }
    return adminuser;
  }

  async makeUserAdmin(
    userId: string,

    // isAdmin: boolean,
  ): Promise<AdminUser> {
    const user = await this.UserModel.findById({ _id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    const userAlreadyAdmin = await this.AdminUserModel.findOne({ userId });

    const updatedAdmin = await this.AdminUserModel.findOneAndUpdate(
      { userId },
      { $set: { isAdmin: !userAlreadyAdmin.isAdmin || user } }, // Toggle between true and false
      { new: true },
    );

    return updatedAdmin;
  }

  async update(
    id: string,
    updateCategoryDto: Partial<UpdateAdminDto>,
  ): Promise<AdminUser> {
    const updateQuery: UpdateQuery<AdminUser> = updateCategoryDto;

    const category = await this.AdminUserModel.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    ).exec();

    if (!category) {
      throw new NotFoundException('Admin User not found');
    }

    return category;
  }

  async remove(userId: string): Promise<void> {
    const result = await this.AdminUserModel.findOneAndDelete({
      userId: userId,
    });
    if (!result) {
      throw new NotFoundException('Admin User not found');
    }
  }
  ////Admin and users
  async SuspendaUser(userId: string): Promise<User> {
    const userDetails = await this.UserModel.findById({ _id: userId });
    if (!userDetails) {
      throw new NotFoundException('User not found');
    }
    userDetails.isSuspended = userDetails.isSuspended === false ? true : false;

    // question.updatedAt = new Date();
    return await userDetails.save();
  }

  async softDeleteaUser(userId: string): Promise<User> {
    const userDetails = await this.UserModel.findById({ _id: userId });
    if (!userDetails) {
      throw new NotFoundException('User not found');
    }
    userDetails.isDeleted = userDetails.isDeleted === false ? true : false;

    // question.updatedAt = new Date();
    return await userDetails.save();
  }
  async findAllNotSoftDeletedUser(query: Query): Promise<User[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.UserModel.find({
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .select('-password') // Exclude the password field
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }
  async findAllNotSuspendedUser(query: Query): Promise<User[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.UserModel.find({
      $or: [{ isSuspended: false }, { isSuspended: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .select('-password') // Exclude the password field
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }
  async findAllSoftDeletedUser(query: Query): Promise<User[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.UserModel.find({ isDeleted: true })
      .sort({ createdAt: -1 })
      .select('-password') // Exclude the password field
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }
  async findAllSuspendedUser(query: Query): Promise<User[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.UserModel.find({ isSuspended: true })
      .sort({ createdAt: -1 })
      .select('-password') // Exclude the password field
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }
  async AdminRemoveUser(userId: string): Promise<void> {
    const result = await this.UserModel.findOneAndDelete({
      userId: userId,
    });
    if (!result) {
      throw new NotFoundException(' User not found');
    }
  }

  async ToggletoMakeUserAdmin(userId: string): Promise<AdminUser> {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let adminUser = await this.AdminUserModel.findOne({ userId });

    if (!adminUser) {
      // If user is not in the admin collection, create an admin entry
      adminUser = await this.AdminUserModel.create({
        userId,
        isAdmin: true,
      });

      // Also update the user model (assuming there is an isAdmin field)
      await this.UserModel.findByIdAndUpdate(userId, { isAdmin: true });

      return adminUser;
    }

    // If already in the admin collection, toggle isAdmin status
    const newAdminStatus = !adminUser.isAdmin;

    // Update the AdminUserModel
    const updatedAdmin = await this.AdminUserModel.findOneAndUpdate(
      { userId },
      { $set: { isAdmin: newAdminStatus } },
      { new: true },
    );

    // Update the UserModel accordingly
    await this.UserModel.findByIdAndUpdate(userId, { isAdmin: newAdminStatus });

    return updatedAdmin;
  }

  ////admin dashboard
  async countAll(): Promise<{
    totalProducts: number;
    totalUsers: number;
    totalAdmins: number;
    totalOrders: number;
    totalPaidOrders: number;
    totalUnPaidOrders: number;
  }> {
    const [
      totalProducts,
      totalUsers,

      totalAdmins,
      totalOrders,
      totalPaidOrders,
      totalUnPaidOrders,
    ] = await Promise.all([
      this.CreativeProductsModel.countDocuments().exec(),
      this.UserModel.countDocuments().exec(),

      this.AdminUserModel.countDocuments({ isAdmin: true }).exec(),
      this.OrderModel.countDocuments().exec(),
      this.OrderModel.countDocuments({ isPaid: true }).exec(),
      this.OrderModel.countDocuments({ isPaid: false }).exec(),
    ]);

    return {
      totalProducts,
      totalUsers,

      totalAdmins,
      totalOrders,
      totalPaidOrders,
      totalUnPaidOrders,
    };
  }

  ///
  async findProductsPostedbyUserId(
    // query: Record<string, any>,
    query: Query,
    userId: string,
  ): Promise<CreativeProducts[]> {
    const resPerPage = 10; // Number of results per page
    const currentPage = Number(query.page) || 1; // Default to page 1 if not provided
    const skip = resPerPage * (currentPage - 1);

    // Ensure the query matches the database schema
    const data = await this.CreativeProductsModel.find({ postedBy: userId })
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .populate({
        path: 'postedBy',
        select: '-password', // Exclude sensitive fields
      })
      .exec();

    return data;
  }

  async findProductsPostedbyLoginUser(
    // query: Record<string, any>,
    query: Query,
    userId: string,
  ): Promise<CreativeProducts[]> {
    const resPerPage = 10; // Number of results per page
    const currentPage = Number(query.page) || 1; // Default to page 1 if not provided
    const skip = resPerPage * (currentPage - 1);

    // Ensure the query matches the database schema
    const data = await this.CreativeProductsModel.find({ postedBy: userId })
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .populate({
        path: 'postedBy',
        select: '-password', // Exclude sensitive fields
      })
      .exec();

    return data;
  }
}
