import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Address {
  @Prop({ required: false })
  street: string;

  @Prop({ required: false })
  city: string;

  @Prop({ required: false })
  zipcode: string;

  @Prop({ required: false })
  state: string;

  @Prop({ required: false })
  county: string;

  @Prop({ required: false })
  country: string;
}
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: false })
  phoneNumber: string;

  @Prop({ enum: ['Vendor', 'User'], default: 'User' })
  userType: string;

  @Prop({ type: Address }) // Explicitly define the type
  address: Address;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;
  @Prop({ required: false })
  profilePics: string;

  @Prop({ default: false, required: false })
  isDeleted: boolean;

  @Prop({ default: false, required: false })
  isSuspended: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
