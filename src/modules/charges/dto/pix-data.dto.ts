import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PixDataDto {
  @ApiProperty({
    description: 'Expiration time in minutes for the PIX code',
    example: 30,
    minimum: 5,
    maximum: 1440,
    default: 30,
  })
  @IsInt()
  @Min(5, { message: 'Expiration time must be at least 5 minutes' })
  @Max(1440, { message: 'Expiration time must be at most 1440 minutes (24 hours)' })
  @IsOptional()
  expiresInMinutes?: number = 30;
}
