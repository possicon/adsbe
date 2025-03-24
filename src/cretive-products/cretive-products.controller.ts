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
    const userId = req.userId;
    return this.cretiveProductsService.updateProduct(id, updateEventDto);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCretiveProductDto: UpdateCretiveProductDto,
  ) {
    return this.cretiveProductsService.update(+id, updateCretiveProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cretiveProductsService.deleteProduct(id);
  }
}
