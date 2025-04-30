import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsPhoneNumber,
  IsNumber,
  MinLength,
  MaxLength,
  Matches,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateCretiveProductDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, {
    message: 'Description is too short. Minimum length is 10 characters',
  })
  @MaxLength(1500, {
    message: 'Description is too long. Maximum length is 1500 characters',
  })
  description: string;

  @IsOptional()
  @IsString()
  @IsEnum(['Image', 'Audio', 'Video', 'Other'], {
    message: 'fileType must be either Image or Audio or Video or Other',
  })
  fileType?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  fileUrl?: string[];

  @IsOptional()
  @IsNumber()
  price?: number;

  // @IsNotEmpty()
  postedBy: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'], {
    message: 'Status must be either Pending or Approved or Rejected',
  })
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productBenefits: string[];
}
