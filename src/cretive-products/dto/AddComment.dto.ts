import { IsNotEmpty, IsString } from 'class-validator';

export class AddCommentDto {
  @IsNotEmpty()
  @IsString() // Validate that it's a string
  commentText: string;
}
