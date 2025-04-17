import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreativeCategoryService } from './creative-category.service';
import { CreateCreativeCategoryDto } from './dto/create-creative-category.dto';
import { UpdateCreativeCategoryDto } from './dto/update-creative-category.dto';
import { CreativeCategory } from './entities/creative-category.entity';
import { Query as ExpressQuery } from 'express-serve-static-core';

@Controller('creative-category')
export class CreativeCategoryController {
  constructor(
    private readonly creativeCategoryService: CreativeCategoryService,
  ) {}

  @Post()
  create(@Body() createCreativeCategoryDto: CreateCreativeCategoryDto) {
    return this.creativeCategoryService.create(createCreativeCategoryDto);
  }

  @Get('pag/all')
  async findAllPagination(
    @Query() query: ExpressQuery,
  ): Promise<CreativeCategory[]> {
    return this.creativeCategoryService.findAll(query);
  }

  @Get()
  findAll() {
    return this.creativeCategoryService.findAlls();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creativeCategoryService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.creativeCategoryService.remove(id);
    return { message: 'Category Deleted successfully' };
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCreativeCategoryDto: UpdateCreativeCategoryDto,
  ) {
    return this.creativeCategoryService.update(id, updateCreativeCategoryDto);
  }
}
