import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { CretiveProductsService } from './cretive-products.service';
import { CreateCretiveProductDto } from './dto/create-cretive-product.dto';
import { UpdateCretiveProductDto } from './dto/update-cretive-product.dto';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreativeProducts } from './entities/cretive-product.entity';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { AddCommentDto } from './dto/AddComment.dto';
@Controller('cretive-products')
export class CretiveProductsController {
  constructor(
    private readonly cretiveProductsService: CretiveProductsService,
  ) {}

  @UseGuards(UserAuthGuard)
  @Post()
  // @UseInterceptors(FileInterceptor('fileUrl'))
  create(
    @Body() createCretiveProductDto: CreateCretiveProductDto,
    @Req() req,
    // @UploadedFile() fileUrl?: Express.Multer.File,
  ) {
    const userId: string = req.userId;
    return this.cretiveProductsService.create(createCretiveProductDto, userId);
  }
  @Get('pag/all')
  async findAllPagination(
    @Query() query: ExpressQuery,
  ): Promise<CreativeProducts[]> {
    return this.cretiveProductsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cretiveProductsService.findOne(id);
  }
  @UseGuards(UserAuthGuard)
  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateCretiveProductDto,
    @Req() req,
  ) {
    const userId: string = req.userId;
    return this.cretiveProductsService.updateProduct(
      id,
      userId,
      updateEventDto,
    );
  }

  @UseGuards(UserAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const userId: string = req.userId;
    return this.cretiveProductsService.deleteProduct(id, userId);
  }
  @Get('category/:categoryName/all')
  async findEventsByCategoryPagination(
    @Query() query: Record<string, any>, // Handles query parameters
    @Param('categoryName') categoryName: string, // Handles URL parameter
  ): Promise<CreativeProducts[]> {
    return this.cretiveProductsService.findProductsByCategoryPagination(
      query,
      categoryName,
    );
  }
  @Get('all/search')
  async searchEvents(@Query() query: any): Promise<CreativeProducts[]> {
    return this.cretiveProductsService.searchEvents(query);
  }
  @Get('product/:slug')
  async getEventBySlug(@Param('slug') slug: string): Promise<CreativeProducts> {
    return this.cretiveProductsService.findBySlug(slug);
  }
  @UseGuards(UserAuthGuard)
  @Patch(':id/comment')
  async addComment(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
    @Req() req,
  ) {
    const userId = req.userId;
    return this.cretiveProductsService.addComment(id, addCommentDto, userId);
  }
}
