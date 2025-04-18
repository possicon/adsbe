import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeliveryCommentDto {
  @IsOptional()
  @IsString() // Validate that it's a string
  commentText: string;

  @IsOptional()
  fileUrl: string;
}
