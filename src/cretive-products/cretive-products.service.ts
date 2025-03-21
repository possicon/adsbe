import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCretiveProductDto } from './dto/create-cretive-product.dto';
import { UpdateCretiveProductDto } from './dto/update-cretive-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CreativeProducts } from './entities/cretive-product.entity';
import { Model } from 'mongoose';
import { Query } from 'express-serve-static-core';
const ImageKit = require('imagekit');
@Injectable()
export class CretiveProductsService {
  private imagekit: ImageKit;
  constructor(
    @InjectModel(CreativeProducts.name)
    private CreativeProductsModel: Model<CreativeProducts>,
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
    const nameExits = await this.CreativeProductsModel.findOne({
      title,
      category,
      postedBy,
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

  findOne(id: number) {
    return `This action returns a #${id} cretiveProduct`;
  }

  update(id: number, updateCretiveProductDto: UpdateCretiveProductDto) {
    return `This action updates a #${id} cretiveProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} cretiveProduct`;
  }
}
