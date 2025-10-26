import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PixPayment,
  CreditCardPayment,
  BoletoPayment,
  Customer,
} from '@prisma/client';
import { PaymentMethod } from '../enums/payment-method.enum';
import { ChargeStatus } from '../enums/charge-status.enum';

export class Charge {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: ChargeStatus })
  status: ChargeStatus;

  @ApiPropertyOptional()
  idempotencyKey?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Relations
  @ApiPropertyOptional()
  pixPayment?: PixPayment;

  @ApiPropertyOptional()
  creditCardPayment?: CreditCardPayment;

  @ApiPropertyOptional()
  boletoPayment?: BoletoPayment;

  @ApiPropertyOptional()
  customer?: Customer;
}
