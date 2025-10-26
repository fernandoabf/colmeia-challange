import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsValidDocument } from '../../../shared/validators/document.validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'João Silva',
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'joao.silva@email.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do cliente (apenas números)',
    example: '12345678901',
  })
  @IsNotEmpty({ message: 'Document is required' })
  @IsString()
  @IsValidDocument({ message: 'Document must be a valid CPF or CNPJ' })
  document: string;

  @ApiProperty({
    description: 'Telefone do cliente (formato internacional)',
    example: '+5511999999999',
  })
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone format' })
  phone: string;
}
