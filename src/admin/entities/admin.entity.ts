import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AdminUser extends Document {
  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId: Types.ObjectId;

  @Prop({ type: [String], required: false, default: [] })
  role: string[];
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
