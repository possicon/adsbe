import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCretiveProductDto } from './dto/create-cretive-product.dto';
import { UpdateCretiveProductDto } from './dto/update-cretive-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CreativeProducts } from './entities/cretive-product.entity';
import { Model, UpdateQuery } from 'mongoose';
import { Query } from 'express-serve-static-core';
import { AdminUser } from 'src/admin/entities/admin.entity';
const ImageKit = require('imagekit');
@Injectable()
export class CretiveProductsService {
  private imagekit: ImageKit;
  constructor(
    @InjectModel(CreativeProducts.name)
    private CreativeProductsModel: Model<CreativeProducts>,
    @InjectModel(AdminUser.name)
    private readonly AdminUserModel: Model<AdminUser>,
  ) {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  async create(
    createCretiveProductDto: CreateCretiveProductDto,
    userId: string,
  ) {
    console.log(userId);
    const { title, description, category, price, fileType, fileUrl, postedBy } =
      createCretiveProductDto;
    const adminUser: any = await this.AdminUserModel.findOne({ userId });
    if (!adminUser || adminUser.isAdmin !== true) {
      throw new BadRequestException(
        'Only Admins are Authorized to create Product',
      );
    }
    const nameExits = await this.CreativeProductsModel.findOne({
      title,
      category,
      postedBy: userId,
    });
    if (nameExits) {
      throw new BadRequestException('Creatives already been created');
    }

    const imageUrls: string[] = [];
    for (const image of fileUrl) {
      const img = await this.imagekit.upload({
        file: image,
        fileName: `${title}-${new Date().getTime()}`,
      });
      imageUrls.push(img.url);
    }

    const createData = new this.CreativeProductsModel({
      title,
      description,
      category,
      fileType,
      price,
      postedBy: userId,
      fileUrl: imageUrls,
    });
    const result = await createData.save();
    return {
      id: result._id,

      title: result.title,

      description: result.description,
      category: result.category,
      fileType: result.fileType,
      fileUrl: result.fileUrl,

      price: result.price,
      status: result.status,

      postedBy: result.postedBy,
      slug: result.slug,
    };
  }

  async findAll(query: Query): Promise<any> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.CreativeProductsModel.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'postedBy',
        select: '-password',
      })

      .limit(resPerPage)
      .skip(skip)

      .exec();

    return data;
  }

  async findOne(id: string) {
    const data = await this.CreativeProductsModel.findById(id);
    if (!data) {
      throw new BadRequestException(`Creative with ${id} not found`);
    }

    return data;
  }

  async updateProduct(
    id: string,
    userId: string,
    updateEventDto: UpdateCretiveProductDto,
  ) {
    const adminUser: any = await this.AdminUserModel.findOne({ userId });
    if (!adminUser || adminUser.isAdmin !== true) {
      throw new BadRequestException(
        'Only Admins are Authorized to create Product',
      );
    }
    const existingEvent = await this.CreativeProductsModel.findById(id).exec();
    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    let imageUrls: string[] = existingEvent.fileUrl || []; // Start with existing image URLs

    if (updateEventDto.fileUrl) {
      try {
        const uploadedImages = await Promise.all(
          updateEventDto.fileUrl.map(async (image) => {
            const uploadResponse = await this.imagekit.upload({
              file: image,
              fileName: `${updateEventDto.title}.jpg`,
              folder: '/productUpdate',
            });
            return uploadResponse.url;
          }),
        );
        imageUrls = [...imageUrls, ...uploadedImages]; // Append new images to existing URLs
        updateEventDto.fileUrl = imageUrls;
      } catch (error) {
        console.error('Error uploading to ImageKit:', error);
        throw new BadRequestException('Error uploading images');
      }
    }

    const updateQuery: UpdateQuery<CreativeProducts> = {
      ...existingEvent.toObject(),
      ...updateEventDto,
      imageUrl: imageUrls,
    };

    const updatedEvent = await this.CreativeProductsModel.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    ).exec();

    if (!updatedEvent) {
      throw new NotFoundException('Event not found');
    }

    return updatedEvent;
  }

  async delete(id: string, userId: string) {
    const product = await this.CreativeProductsModel.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return { message: 'Product deleted successfully' };
  }
  async deleteProduct(id: string, userId: string) {
    const product = await this.CreativeProductsModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if the user is an admin
    const adminUser = await this.AdminUserModel.findOne({ userId });
    if (adminUser && adminUser.isAdmin === true) {
      await this.CreativeProductsModel.findByIdAndDelete(id);
      return { message: 'Event deleted successfully by admin' };
    }

    throw new ForbiddenException(
      'You are not authorized to delete this product',
    );
  }
  update(id: number, updateCretiveProductDto: UpdateCretiveProductDto) {
    return `This action updates a #${id} cretiveProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} cretiveProduct`;
  }
}
