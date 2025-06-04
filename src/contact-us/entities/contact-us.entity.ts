import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ContactUs extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: false })
  email: string;

  @Prop({ required: true, unique: false })
  phoneNumber: string;

  @Prop({ required: true, unique: false })
  subject: string;

  @Prop({ required: true, unique: false })
  contentMsg: string;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);
