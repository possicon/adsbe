import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsObject,
  IsString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDTO {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNumber()
  totalQuantity: number;

  @IsNumber()
  totalPrice: number;
}

class BillingInfoDTO {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  country: string;

  @IsString()
  state: string;

  @IsString()
  address: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  redirect_url: string;

  @IsArray()
  //   @ValidateNested({ each: true })
  @Type(() => OrderItemDTO)
  orderItems: OrderItemDTO[];

  @IsObject()
  @ValidateNested()
  @Type(() => BillingInfoDTO)
  billingInfo: BillingInfoDTO;
}
