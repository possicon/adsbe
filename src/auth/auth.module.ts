import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/auth.entity';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './entities/refresh-token.schema';
import { ResetToken, ResetTokenSchema } from './entities/rest-token.schema';
import { ImageKitServiceAuth } from './service/imageKit';
import { MailService } from './service/mail.service';
import { AdminUser, AdminUserSchema } from 'src/admin/entities/admin.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
      {
        name: ResetToken.name,
        schema: ResetTokenSchema,
      },
      {
        name: AdminUser.name,
        schema: AdminUserSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, ImageKitServiceAuth],
})
export class AuthModule {}
