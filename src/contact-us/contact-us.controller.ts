import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';
import { ContactUs } from './entities/contact-us.entity';
import { Query as ExpressQuery } from 'express-serve-static-core';
@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  create(@Body() createContactUsDto: CreateContactUsDto) {
    return this.contactUsService.create(createContactUsDto);
  }
  @Get('pag/all')
  async findAll(@Query() query: ExpressQuery): Promise<ContactUs[]> {
    return this.contactUsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactUsService.findOne(id);
  }

  @UseGuards(UserAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const userId: any = req.userId;
    return this.contactUsService.remove(id, userId);
  }
}
