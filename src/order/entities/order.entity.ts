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

  @Prop({ type: Number, default: 0.0 })
  grandTotal: number;

  @Prop({ required: false })
  amountPaid: string;

  @Prop({
    required: false,
    default: function () {
      return (parseFloat(this.amountPaid) || 0) * 0.1;
    },
  })
  commission: number;

  @Prop({ required: false })
  date: String;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
