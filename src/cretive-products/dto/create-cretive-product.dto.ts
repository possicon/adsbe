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

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(1500)
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
}
