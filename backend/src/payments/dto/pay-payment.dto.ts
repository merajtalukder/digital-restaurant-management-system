import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaymentMethod } from '@prisma/client';

export class PayPaymentDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionId?: string;
}