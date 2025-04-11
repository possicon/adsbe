export class CretiveProduct {}
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  commentText: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}
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
    validate: {
      validator: (val: string[]) => val.length <= 5,
      message: 'You can upload a maximum of 5 images',
    },
  })
  fileUrl: string[];

  @Prop({ type: [String], default: [] })
  views: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  postedBy: Types.ObjectId;

  @Prop({ unique: true, required: false })
  slug: string;
  @Prop([{ type: Comment }])
  comments: Comment[];
  @Prop({
    required: false,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;
}
const CreativeProductsSchema = SchemaFactory.createForClass(CreativeProducts);

// Generate slug from the title before saving

CreativeProductsSchema.pre<CreativeProducts>('save', async function (next) {
  if (this.isModified('title')) {
    const model = this.constructor as Model<CreativeProducts>;
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    // Ensure uniqueness
    while (await model.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }

  next();
});
export { CreativeProductsSchema };
