import { Injectable } from '@nestjs/common';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';

@Injectable()
export class ContactUsService {
  create(createContactUsDto: CreateContactUsDto) {
    return 'This action adds a new contactUs';
  }

  findAll() {
    return `This action returns all contactUs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contactUs`;
  }

  update(id: number, updateContactUsDto: UpdateContactUsDto) {
    return `This action updates a #${id} contactUs`;
  }

  remove(id: number) {
    return `This action removes a #${id} contactUs`;
  }
}
