export class CretiveProduct {}
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({ timestamps: true })
export class CreativeProducts extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({
    required: true,
    minlength: 10, // Minimum length for description
    maxlength: 1500,
  })
  description: string;

  @Prop({ required: false })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop({ enum: ['Image', 'Audio', 'Video', 'Other'], default: 'Other' })
  fileType: string;

  @Prop({
    type: [String],
    required: false,
    validate: [
      (val: string[]) => val.length <= 5,
      'You can upload a maximum of 5 images',
    ],
  })
  fileUrl: string[];

  @Prop({ type: [String], default: [] })
  views: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  postedBy: Types.ObjectId;

  @Prop({ unique: true, required: false })
  slug: string;

  @Prop({
    required: false,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;
}
const CreativeProductsSchema = SchemaFactory.createForClass(CreativeProducts);

// Generate slug from the title before saving
CreativeProductsSchema.pre<CreativeProducts>('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export { CreativeProductsSchema };
