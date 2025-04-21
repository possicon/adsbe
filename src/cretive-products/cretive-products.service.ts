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
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Query } from 'express-serve-static-core';
import { AdminUser } from 'src/admin/entities/admin.entity';
const ImageKit = require('imagekit');
import slugify from 'slugify';
import { AddCommentDto } from './dto/AddComment.dto';
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
    files?: Express.Multer.File[],
  ) {
    const { title, description, category, price, productBenefits, fileType } =
      createCretiveProductDto;

    const adminUser: any = await this.AdminUserModel.findOne({ userId });
    if (!adminUser || adminUser.isAdmin !== true) {
      throw new BadRequestException(
        'Only Admins are Authorized to create Product',
      );
    }

    const nameExists = await this.CreativeProductsModel.findOne({
      title,
      category,
      postedBy: userId,
    });

    if (nameExists) {
      throw new BadRequestException('Creatives already been created');
    }

    const imageUrls: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const base64Image = file.buffer.toString('base64');
          const mimeType = file.mimetype;
          const dataUri = `data:${mimeType};base64,${base64Image}`;
          const ext = file.originalname.split('.').pop();
          const fileUpload = await this.imagekit.upload({
            file: dataUri,
            fileName: `${title}-${Date.now()}.${ext}`,
            folder: '/Products',
          });
          imageUrls.push(fileUpload.url);
        } catch (error) {
          console.error('ImageKit Upload Error:', error);
          throw new BadRequestException('Error uploading creative file(s)');
        }
      }
    }

    const createData = new this.CreativeProductsModel({
      title,
      description,
      category,
      fileType,
      price,
      postedBy: userId,
      productBenefits,
      fileUrl: imageUrls,
    });

    const result = await createData.save();
    return {
      id: result._id,
      title: result.title,
      description: result.description,
      category: result.category,
      productBenefits: result.productBenefits,
      fileType: result.fileType,
      fileUrl: result.fileUrl,
      price: result.price,
      status: result.status,
      postedBy: result.postedBy,
      slug: result.slug,
    };
  }

  async createNew(
    createCretiveProductDto: CreateCretiveProductDto,
    userId: string,
  ) {
    console.log(userId);
    const {
      title,
      description,
      category,
      price,
      productBenefits,
      fileType,
      fileUrl,
      postedBy,
    } = createCretiveProductDto;
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
      productBenefits,
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
      productBenefits: result.productBenefits,
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
    updateProductDto: UpdateCretiveProductDto,
    files?: Express.Multer.File[],
  ) {
    const adminUser: any = await this.AdminUserModel.findOne({ userId });
    if (!adminUser || adminUser.isAdmin !== true) {
      throw new BadRequestException(
        'Only Admins are Authorized to update Product',
      );
    }

    const existingEvent = await this.CreativeProductsModel.findById(id).exec();
    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    let imageUrls: string[] = existingEvent.fileUrl || [];

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const base64Image = file.buffer.toString('base64');
          const mimeType = file.mimetype;
          const dataUri = `data:${mimeType};base64,${base64Image}`;
          const ext = file.originalname.split('.').pop();
          const fileUpload = await this.imagekit.upload({
            file: dataUri,
            fileName: `${updateProductDto.title}-${Date.now()}.${ext}`,
            folder: '/productUpdate',
          });
          imageUrls.push(fileUpload.url);
        } catch (error) {
          console.error('ImageKit Upload Error:', error);
          throw new BadRequestException('Error uploading creative file(s)');
        }
      }

      updateProductDto.fileUrl = imageUrls;
    }

    if (
      updateProductDto.title &&
      updateProductDto.title !== existingEvent.title
    ) {
      const baseSlug = slugify(updateProductDto.title, {
        lower: true,
        strict: true,
      });

      let uniqueSlug = baseSlug;
      let suffix = 1;

      while (await this.CreativeProductsModel.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${suffix++}`;
      }

      updateProductDto.slug = uniqueSlug;
    }

    const updateQuery: UpdateQuery<CreativeProducts> = {
      ...existingEvent.toObject(),
      ...updateProductDto,
      fileUrl: imageUrls,
    };

    const updatedEvent = await this.CreativeProductsModel.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true },
    ).exec();

    if (!updatedEvent) {
      throw new NotFoundException('Product not found');
    }

    return updatedEvent;
  }

  async updateProductJson(
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
    if (updateEventDto.title && updateEventDto.title !== existingEvent.title) {
      const baseSlug = slugify(updateEventDto.title, {
        lower: true,
        strict: true,
      });

      let uniqueSlug = baseSlug;
      let suffix = 1;

      // Ensure uniqueness
      while (await this.CreativeProductsModel.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${suffix++}`;
      }

      updateEventDto.slug = uniqueSlug;
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
      return { message: 'Product deleted successfully by admin' };
    }

    throw new ForbiddenException(
      'You are not authorized to delete this product',
    );
  }
  async findProductsByCategoryPagination(
    // query: Record<string, any>,
    query: Query,
    category: string,
  ): Promise<CreativeProducts[]> {
    const resPerPage = 10; // Number of results per page
    const currentPage = Number(query.page) || 1; // Default to page 1 if not provided
    const skip = resPerPage * (currentPage - 1);

    // Ensure the query matches the database schema
    const data = await this.CreativeProductsModel.find({ category })
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
  /////search for events
  async searchEvents(query: any): Promise<CreativeProducts[]> {
    const filter: FilterQuery<CreativeProducts> = {};

    if (query.query && query.query !== '*') {
      const searchRegex = { $regex: query.query, $options: 'i' };
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    return this.CreativeProductsModel.find(filter)
      .populate({
        path: 'postedBy',
        select: '-password', // Exclude the password field
      })
      .exec();
  }
  async findBySlug(slug: string): Promise<CreativeProducts> {
    const product = await this.CreativeProductsModel.findOne({ slug }).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async addComment(id: string, addCommentDto: AddCommentDto, userId: string) {
    const addComment = await this.CreativeProductsModel.findById(id);
    if (!addComment) {
      throw new NotFoundException('Product not found');
    }

    const newComment: any = {
      userId: userId,
      commentText: addCommentDto.commentText,
      createdAt: new Date(),
    };

    addComment.comments.push(newComment);
    return await addComment.save();
  }
}
