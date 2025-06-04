import { PartialType } from '@nestjs/mapped-types';
import { CreateCreativeCategoryDto } from './create-creative-category.dto';

export class UpdateCreativeCategoryDto extends PartialType(CreateCreativeCategoryDto) {}
