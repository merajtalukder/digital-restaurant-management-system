import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsInt()
  orderId!: number;

  @IsNumber()
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionId?: string;
}