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
  UploadedFiles,
} from '@nestjs/common';
import { CretiveProductsService } from './cretive-products.service';
import { CreateCretiveProductDto } from './dto/create-cretive-product.dto';
import { UpdateCretiveProductDto } from './dto/update-cretive-product.dto';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { CreativeProducts } from './entities/cretive-product.entity';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { AddCommentDto } from './dto/AddComment.dto';
import { diskStorage, memoryStorage } from 'multer';
@Controller('cretive-products')
export class CretiveProductsController {
  constructor(
    private readonly cretiveProductsService: CretiveProductsService,
  ) {}
  @Post()
  @UseGuards(UserAuthGuard)
  @UseInterceptors(
    FilesInterceptor('fileUrl', 5, {
      storage: diskStorage({
        destination: './FileUploads',

        filename: (req, file, cb) => {
          const sanitized = file.originalname
            .replace(/\s+/g, '')
            .replace(/[^a-zA-Z0-9.-]/g, '');
          cb(null, `${Date.now()}-${sanitized}`);
        },
      }),
      limits: { files: 5 },
    }),
  )
  async createCreativeProducts(
    @Body('createDto') createDto: string,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = req.userId;
    const parsedDto = JSON.parse(createDto); // convert string to object
    return this.cretiveProductsService.createPoroduct(parsedDto, userId, files);
  }
  @Post('create')
  @UseGuards(UserAuthGuard)
  @UseInterceptors(
    FilesInterceptor('fileUrl', 5, {
      storage: memoryStorage(),

      limits: { files: 5 },
    }),
  )
  async createCreativeProduct(
    @Body('createDto') createDto: string,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = req.userId;
    const parsedDto = JSON.parse(createDto); // convert string to object
    return this.cretiveProductsService.create(parsedDto, userId, files);
  }

  @UseGuards(UserAuthGuard)
  @Post('/new')
  // @UseInterceptors(FileInterceptor('fileUrl'))
  createNew(
    @Body() createCretiveProductDto: CreateCretiveProductDto,
    @Req() req,
    // @UploadedFile() fileUrl?: Express.Multer.File,
  ) {
    const userId: string = req.userId;
    return this.cretiveProductsService.createNew(
      createCretiveProductDto,
      userId,
    );
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
  @Patch(':id/update')
  updateProductJson(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateCretiveProductDto,
    @Req() req,
  ) {
    const userId: string = req.userId;
    return this.cretiveProductsService.updateProductJson(
      id,
      userId,
      updateProductDto,
    );
  }
  @Patch(':id')
  @UseGuards(UserAuthGuard)
  @UseInterceptors(
    FilesInterceptor('fileUrl', 5, {
      storage: diskStorage({
        destination: './FileUploads',
        filename: (req, file, cb) => {
          const sanitized = file.originalname
            .replace(/\s+/g, '')
            .replace(/[^a-zA-Z0-9.-]/g, '');
          cb(null, `${Date.now()}-${sanitized}`);
        },
      }),
      limits: { files: 5 },
    }),
  )
  async updateProductLocal(
    @Param('id') id: string,
    @Body('updateProductDto') updateProductDto: string,

    @UploadedFiles()
    files: { files?: Express.Multer.File[] },
    @Req() req,
  ) {
    const userId: string = req.userId;
    const parsedDto = JSON.parse(updateProductDto);
    return this.cretiveProductsService.updateProductLocalStorage(
      id,
      userId,
      parsedDto,
      files?.files || [],
    );
  }
  @Patch(':id/newUpdate')
  @UseGuards(UserAuthGuard)
  @UseInterceptors(
    FilesInterceptor('fileUrl', 5, {
      storage: memoryStorage(),

      limits: { files: 5 },
    }),
  )
  async updateProduct(
    @Param('id') id: string,
    @Body('updateProductDto') updateProductDto: string,

    @UploadedFiles()
    files: { files?: Express.Multer.File[] },
    @Req() req,
  ) {
    const userId: string = req.userId;
    const parsedDto = JSON.parse(updateProductDto);
    return this.cretiveProductsService.updateProduct(
      id,
      userId,
      parsedDto,
      files?.files || [],
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
