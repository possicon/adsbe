// export class Order {}
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../dto/paystack-payment.dto';

///// cartItems
export class OrderItems {
  @Prop({ type: Types.ObjectId, ref: 'CreativeProducts', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Number, required: true, default: 1 })
  totalQuantity: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  totalPrice: number;
}

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: false })
  commentText: string;

  @Prop({ required: false })
  fileUrl: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}
@Schema({ timestamps: true })
export class DeliveryStatus {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    required: false,
    enum: ['ongoing', 'delivered', 'on-review'],
    default: 'ongoing',
  })
  deliveryStatus: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class DeliveryComment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: false })
  commentText: string;

  @Prop({ required: false })
  fileUrl: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}
//// Billing Info
@Schema({ timestamps: true })
export class BillingInfo {
  @Prop({ type: String, required: false })
  firstName: string;

  @Prop({ type: String, required: false })
  lastName: string;

  @Prop({ type: String, required: false })
  email: string;

  @Prop({ type: String, required: false })
  phone: string;

  @Prop({ type: String, required: false })
  country: string;

  @Prop({ type: String, required: false })
  state: string;

  @Prop({ type: String, required: false })
  address: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;
}
///paystack
@Schema({ timestamps: true })
export class Paystack {
  @Prop({ required: true, unique: true })
  reference: string;

  @Prop()
  authorization_url: string;

  @Prop()
  access_code: string;

  @Prop()
  transactionStatus: string;

  @Prop({ name: 'status', default: PaymentStatus.notPaid })
  status: PaymentStatus;

  @Prop({ required: false, type: [OrderItems] }) // Ensure it's an array of embedded OrderItems
  orderItems: OrderItems[];

  @Prop({ type: Number, default: 0.0 })
  amount: number;

  @Prop({ type: String, required: false })
  email: string;
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId: Types.ObjectId;

  @Prop({
    required: false,
  })
  billingInfo: BillingInfo;
  @Prop({ type: Date, default: Date.now })
  date: Date;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: false })
  paymentMethod: string;

  @Prop({ required: true, type: [OrderItems] })
  orderItems: OrderItems[];

  @Prop({ required: false })
  billingInfo: BillingInfo;

  @Prop({ required: false })
  payStackPayment: Paystack;

  @Prop({ required: false })
  redirect_url: string;

  @Prop({ required: false, default: false })
  isPaid: boolean;

  @Prop({ type: DeliveryStatus })
  deliveryStatus: DeliveryStatus;

  @Prop({ type: Number, default: 0.0 })
  grandTotal: number;

  @Prop({ required: false })
  projectDsc: string;

  @Prop([{ type: Comment }])
  comments: Comment[];

  @Prop([{ type: DeliveryComment }])
  deliveryComment: DeliveryComment[];

  @Prop({ required: false })
  amountPaid: string;

  @Prop({ required: false })
  date: String;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
