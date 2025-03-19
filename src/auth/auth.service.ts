import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/auth.entity';
import { Model, UpdateQuery } from 'mongoose';
import { RefreshToken } from './entities/refresh-token.schema';
import { JwtService } from '@nestjs/jwt';
import { MailService } from './service/mail.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { nanoid } from 'nanoid';
// import ImageKit from 'imagekit';
const ImageKit = require('imagekit');
import { Query } from 'express-serve-static-core';
import { UpdateProfileDto } from './dto/profileUpdate.dto';
import { ResetToken } from './entities/rest-token.schema';
@Injectable()
export class AuthService {
  private imagekit: ImageKit;
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,

    private jwtService: JwtService,
    private mailService: MailService,
  ) {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  async create(createAuthDto: CreateAuthDto) {
    const {
      email,
      password,
      firstName,
      lastName,
      profilePics,
      phoneNumber,
      address,
      userType,
    } = createAuthDto;

    // Check if email is in use
    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Initialize profilePicsUrl as undefined
    let profilePicsUrl: string | undefined;

    if (profilePics) {
      try {
        // Log profilePics to check if the file is correctly uploaded
        console.log('Received profilePics:', profilePics);

        const img = await this.imagekit.upload({
          file: profilePics, // Ensure file buffer is correct
          fileName: `${firstName}-${lastName}-${Date.now()}.jpg`, // Unique filename with timestamp
          folder: '/profilePics',
        });

        // Log the response from ImageKit
        console.log('ImageKit upload response:', img);

        profilePicsUrl = img.url; // Assign uploaded image URL
      } catch (error) {
        console.error('Error uploading to ImageKit:', error); // Log error for debugging
        throw new BadRequestException('Error uploading profile picture');
      }
    }

    // Log the profilePicsUrl before saving to MongoDB
    console.log('Profile picture URL:', profilePicsUrl);

    // Create user document and save in MongoDB
    const newUser = new this.UserModel({
      email,
      password: hashedPassword,
      firstName,
      address,
      lastName,
      phoneNumber,
      userType,
      profilePics: profilePicsUrl, // Save profilePics URL if provided
    });

    await newUser.save();
    try {
      await this.mailService.signupMail(email, firstName, lastName);
    } catch (error) {
      throw new Error(`Failed to send email to ${email}`);
    }
    // Prepare JWT payload and sign the token
    const payload = {
      email: newUser.email,
      sub: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phoneNumber: newUser.phoneNumber,
      profilePics: newUser.profilePics,
      address: newUser.address,
      userType: newUser.userType,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        address: newUser.address,
        phoneNumber: newUser.phoneNumber,
        userType: newUser.userType,
        profilePics: newUser.profilePics, // Return profilePics in response if provided
      },
    };
  }
  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    //Find if user exists by email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Compare entered password with existing password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Generate JWT tokens
    const tokens = await this.generateUserTokens(user._id);
    return {
      ...tokens,
      userId: user._id,
      email: user.email,
      // isAdmin: user.isAdmin,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePics: user.profilePics,
      address: user.address,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
    };
  }
  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '10h' });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }

  async findAll(query: Query): Promise<any> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const data = await this.UserModel.find()
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .select('-password')
      .exec();

    return data;
  }
  async findOne(id: string): Promise<any> {
    const user = await this.UserModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  async findUserProfile(id: string): Promise<any> {
    const user = await this.UserModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user,
    };
  }
  async updateProfile(
    id: string,
    updateUserDto: UpdateProfileDto,
  ): Promise<User> {
    const existingUser = await this.UserModel.findById(id).exec();
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    let profilePicsUrl: string | undefined;

    if (updateUserDto.profilePics) {
      try {
        const img = await this.imagekit.upload({
          file: updateUserDto.profilePics,
          fileName: `${updateUserDto.firstName}.jpg`,
          folder: '/profilePics',
        });

        profilePicsUrl = img.url;
        updateUserDto.profilePics = profilePicsUrl;
      } catch (error) {
        console.error('Error uploading to ImageKit:', error);
        throw new BadRequestException('Error uploading profile picture');
      }
    }

    // const updateQuery: UpdateQuery<User> = updateUserDto;
    const updateQuery: UpdateQuery<User> = {
      ...existingUser.toObject(), // Convert existing user to a plain object
      ...updateUserDto, // Override fields with the new values from updateUserDto
    };
    // Update user in MongoDB
    const user = await this.UserModel.findByIdAndUpdate(id, updateQuery, {
      new: true,
    }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async forgotPassword(email: string) {
    //Check that user exists
    const user = await this.UserModel.findOne({ email });

    if (user) {
      //If user exists, generate password reset link
      // const { nanoid } = await import('nanoid');
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = nanoid(64);
      await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
      });
      //Send the link to the user by email
      this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    return {
      message:
        'You are a registered User, please check your email for password reset',
    };
  }

  async resetPassword(newPassword: string, resetToken: string) {
    //Find a valid reset token document
    const token = await this.ResetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid link');
    }

    //Change user password (MAKE SURE TO HASH!!)
    const user = await this.UserModel.findById(token.userId);
    if (!user) {
      throw new InternalServerErrorException();
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }
  async changePassword(userId, oldPassword: string, newPassword: string) {
    //Find the user
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    //Compare the old password with the password in DB
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Change user's password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
