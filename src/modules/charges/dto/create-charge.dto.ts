import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PixDataDto } from './pix-data.dto';
import { CreditCardDataDto } from './credit-card-data.dto';
import { BoletoDataDto } from './boleto-data.dto';

export class CreateChargeDto {
  @ApiProperty({
    description: 'Customer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Customer ID must be a valid UUID' })
  customerId: string;

  @ApiProperty({
    description: 'Charge amount',
    example: 150.5,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'BRL',
    default: 'BRL',
  })
  @IsOptional()
  @IsString()
  currency?: string = 'BRL';

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.PIX,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'PIX payment data (required when paymentMethod is PIX)',
    type: PixDataDto,
  })
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.PIX)
  @ValidateNested()
  @Type(() => PixDataDto)
  pixData?: PixDataDto;

  @ApiPropertyOptional({
    description: 'Credit card data (required when paymentMethod is CREDIT_CARD)',
    type: CreditCardDataDto,
  })
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.CREDIT_CARD)
  @IsNotEmpty({ message: 'Credit card data is required for CREDIT_CARD payment method' })
  @ValidateNested()
  @Type(() => CreditCardDataDto)
  creditCardData?: CreditCardDataDto;

  @ApiPropertyOptional({
    description: 'Boleto data (required when paymentMethod is BOLETO)',
    type: BoletoDataDto,
  })
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.BOLETO)
  @IsNotEmpty({ message: 'Boleto data is required for BOLETO payment method' })
  @ValidateNested()
  @Type(() => BoletoDataDto)
  boletoData?: BoletoDataDto;
}
