import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/auth.entity';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { UserAuthGuard } from './guards/auth.guard';
import { UpdateProfileDto } from './dto/profileUpdate.dto';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @UseInterceptors(FileInterceptor('profilePics')) // Interceptor for file handling
  async signup(
    @Body() signupData: CreateAuthDto,
    @UploadedFile() profilePics?: Express.Multer.File, // Optional file parameter
  ) {
    // Pass both signup data and the optional profilePics to the service
    return this.authService.create(signupData);
  }
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }
  @Get('pag/all')
  async findAllUsersPagination(@Query() query: ExpressQuery): Promise<User[]> {
    return this.authService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  @Get('userProfile/details')
  @UseGuards(UserAuthGuard)
  findUserProfile(@Req() req) {
    const id = req.userId;

    return this.authService.findUserProfile(id);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.resetToken,
    );
    return { message: 'New Password changed successfully' };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @UseGuards(UserAuthGuard)
  @Patch('profile/update')
  @UseInterceptors(FileInterceptor('profilePics'))
  async updateProfile(
    @UploadedFile() file: Express.Multer.File,
    // @Body() updateUserDto: UpdateProfileDto,
    @Body('updateUserDto') updateUserDto: string,
    @Req() req,
  ) {
    const id = req.userId;
    const parsedDto = JSON.parse(updateUserDto);
    return this.authService.updateProfile(id, parsedDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
