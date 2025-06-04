import { Module } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactUs, ContactUsSchema } from './entities/contact-us.entity';
import { AdminUser, AdminUserSchema } from 'src/admin/entities/admin.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ContactUs.name,
        schema: ContactUsSchema,
      },
      {
        name: AdminUser.name,
        schema: AdminUserSchema,
      },
    ]),
  ],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}
