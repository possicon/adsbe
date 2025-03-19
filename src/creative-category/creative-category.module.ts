import { Module } from '@nestjs/common';
import { CreativeCategoryService } from './creative-category.service';
import { CreativeCategoryController } from './creative-category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CreativeCategory,
  CreativeCategorySchema,
} from './entities/creative-category.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CreativeCategory.name,
        schema: CreativeCategorySchema,
      },
    ]),
  ],

  controllers: [CreativeCategoryController],
  providers: [CreativeCategoryService],
})
export class CreativeCategoryModule {}
