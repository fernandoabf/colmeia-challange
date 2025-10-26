import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class BoletoDataDto {
  @ApiProperty({
    description: 'Due date for the boleto (YYYY-MM-DD format)',
    example: '2025-11-10',
  })
  @IsNotEmpty()
  @IsDateString({}, { message: 'Due date must be a valid date in ISO format (YYYY-MM-DD)' })
  dueDate: string;
}
