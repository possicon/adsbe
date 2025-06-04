import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  isAdmin?: boolean;
}
