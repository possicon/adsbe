import { PartialType } from '@nestjs/mapped-types';
import { CreateCretiveProductDto } from './create-cretive-product.dto';

export class UpdateCretiveProductDto extends PartialType(CreateCretiveProductDto) {}
