import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase()) // Transform email to lowercase
  email: string;

  @IsOptional()
  name: string;

  @IsOptional()
  profilePics: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  address: {
    country: string;
    state: string;
    county: string;
    city: string;
    postalCode: string;
    street: string;
  };

  @IsOptional()
  @IsString()
  userType?: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  password: string;

  isDeleted: boolean;

  isSuspended: boolean;
}
