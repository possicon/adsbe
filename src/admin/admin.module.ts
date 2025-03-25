import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUser, AdminUserSchema } from './entities/admin.entity';
import { User, UserSchema } from 'src/auth/entities/auth.entity';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'src/auth/entities/refresh-token.schema';
import {
  ResetToken,
  ResetTokenSchema,
} from 'src/auth/entities/rest-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AdminUser.name,
        schema: AdminUserSchema,
      },
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
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
