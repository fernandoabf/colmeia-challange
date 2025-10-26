import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length, Matches, Max, Min } from 'class-validator';

export class CreditCardDataDto {
  @ApiProperty({
    description: 'Credit card number (without spaces)',
    example: '4111111111111111',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'Card number must contain only digits (13-19 digits)' })
  cardNumber: string;

  @ApiProperty({
    description: 'Cardholder name (as printed on the card)',
    example: 'JOAO SILVA',
  })
  @IsNotEmpty()
  @IsString()
  cardHolderName: string;

  @ApiProperty({
    description: 'Expiry month (01-12)',
    example: '12',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Expiry month must be between 01 and 12' })
  expiryMonth: string;

  @ApiProperty({
    description: 'Expiry year (last 2 digits)',
    example: '26',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}$/, { message: 'Expiry year must be 2 digits' })
  expiryYear: string;

  @ApiProperty({
    description: 'Card security code (CVV/CVC)',
    example: '123',
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 4, { message: 'CVV must be 3 or 4 digits' })
  @Matches(/^\d{3,4}$/, { message: 'CVV must contain only digits' })
  cvv: string;

  @ApiProperty({
    description: 'Number of installments',
    example: 3,
    minimum: 1,
    maximum: 12,
    default: 1,
  })
  @IsInt()
  @Min(1, { message: 'Installments must be at least 1' })
  @Max(12, { message: 'Installments must be at most 12' })
  installments: number = 1;
}
