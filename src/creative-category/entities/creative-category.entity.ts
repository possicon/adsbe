import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CreativeCategory extends Document {
  @Prop({ required: true })
  name: string;
}

export const CreativeCategorySchema =
  SchemaFactory.createForClass(CreativeCategory);
