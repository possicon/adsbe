import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

// DTO for Signup with required validation rules
export class UpdateProfileDto {
  @IsOptional()
  firstName: string;

  @IsOptional()
  lastName: string;

  @IsOptional()
  email: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  profilePics?: string;

  @IsOptional()
  // @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  readonly phoneNumber: string;

  @IsOptional()
  address?: {
    country?: string;
    state?: string;
    county?: string;
    city?: string;
    postalCode?: string;
    street?: string;
  };

  //   @IsOptional()
  //   @MinLength(6)
  //   @Matches(/^(?=.*[0-9])/, {
  //     message: 'Password must contain at least one number',
  //   })
  //   password?: string;
}
