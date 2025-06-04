import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateContactUsDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase()) // Transform email to lowercase
  email: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  subject: string;

  @IsNotEmpty()
  contentMsg: string;
}
