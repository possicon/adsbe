import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ContactUs } from './entities/contact-us.entity';
import { Model } from 'mongoose';
import { Query } from 'express-serve-static-core';
import { AdminUser } from 'src/admin/entities/admin.entity';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectModel(ContactUs.name) private ContactUsModel: Model<ContactUs>,
    @InjectModel(AdminUser.name) private AdminUserModel: Model<AdminUser>,
  ) {}
  async create(createContactUsDto: CreateContactUsDto) {
    const { firstName, lastName, email, phoneNumber, subject, contentMsg } =
      createContactUsDto;
    const contactForm = await this.ContactUsModel.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      subject,
      contentMsg,
    });
    const result = await contactForm.save();

    return {
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      subject: result.subject,
      phoneNumber: result.phoneNumber,
      contactForm: result.contentMsg,
    };
  }
  async findAll(query: Query): Promise<any> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.ContactUsModel.find()
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .exec();

    return data;
  }
  async findOne(id: string): Promise<any> {
    const data = await this.ContactUsModel.findById(id)
      .select('-password')
      .exec();
    if (!data) {
      throw new NotFoundException('Contact Form not found');
    }

    return data;
  }

  async remove(id: string, userId: string) {
    const adminUser = await this.AdminUserModel.findOne({ userId: userId });
    if (!adminUser || adminUser.isAdmin !== true) {
      throw new BadRequestException('Only Admin can delete a user');
    }

    const deleteContactForm = await this.ContactUsModel.findByIdAndDelete(id);
    if (!deleteContactForm) {
      throw new BadRequestException('Contact form not found');
    }
    return { message: 'Contact Form Deleted' };
  }
}
