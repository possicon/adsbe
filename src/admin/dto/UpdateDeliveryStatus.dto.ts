import { IsEnum } from 'class-validator';

export class UpdateDeliveryStatusDto {
  @IsEnum(['ongoing', 'delivered', 'on-review'])
  deliveryStatus: 'ongoing' | 'delivered' | 'on-review';
}
