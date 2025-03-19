import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCreativeCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
