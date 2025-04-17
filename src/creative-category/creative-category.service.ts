import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCreativeCategoryDto } from './dto/create-creative-category.dto';
import { UpdateCreativeCategoryDto } from './dto/update-creative-category.dto';
import { CreativeCategory } from './entities/creative-category.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Query } from 'express-serve-static-core';
@Injectable()
export class CreativeCategoryService {
  constructor(
    @InjectModel(CreativeCategory.name)
    private CreativeCategoryModel: Model<CreativeCategory>,
  ) {}

  async create(createCreativeCategoryDto: CreateCreativeCategoryDto) {
    const { name } = createCreativeCategoryDto;
    const nameExits = await this.CreativeCategoryModel.findOne({
      name,
    });
    if (nameExits) {
      throw new BadRequestException('Name already in use');
    }
    // const modifyName = name.replace(/\s+/g, '-');

    const newCreativeCat = new this.CreativeCategoryModel({
      name,
    });
    const result = await newCreativeCat.save();
    return {
      id: result._id,
      name: result.name,
    };
  }
  async findAll(query: Query): Promise<any> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.CreativeCategoryModel.find()
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .exec();

    return data;
  }
  async findAlls(): Promise<CreativeCategory[]> {
    return this.CreativeCategoryModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<CreativeCategory> {
    const category = await this.CreativeCategoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Creative Category not found');
    }
    return category;
  }
  async Delete(id: string): Promise<{ message: string }> {
    const category =
      await this.CreativeCategoryModel.findByIdAndDelete(id).exec();
    if (!category) {
      throw new NotFoundException('Creative Category not found');
    }
    return { message: 'New Password changed successfully' };
  }
  async update(
    id: string,
    updateCreativeCategoryDto: Partial<UpdateCreativeCategoryDto>,
  ): Promise<CreativeCategory> {
    const updateQuery: UpdateQuery<CreativeCategory> =
      updateCreativeCategoryDto;

    const category = await this.CreativeCategoryModel.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    ).exec();

    if (!category) {
      throw new NotFoundException('Creative Category not found');
    }

    return category;
  }
  async remove(id: string): Promise<void> {
    const result = await this.CreativeCategoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Creative Category not found');
    }
  }
}
