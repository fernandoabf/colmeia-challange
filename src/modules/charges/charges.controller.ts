import { Controller, Get, Post, Body, Param, Headers, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { ChargesService } from './charges.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { Charge } from './entities/charge.entity';
import { ChargeStatus } from './enums/charge-status.enum';

@ApiTags('charges')
@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new charge' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'UUID v4 to ensure idempotency',
  })
  @ApiResponse({
    status: 201,
    description: 'Charge created successfully',
    type: Charge,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  create(
    @Body() createChargeDto: CreateChargeDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<Charge> {
    return this.chargesService.create(createChargeDto, idempotencyKey);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a charge by ID' })
  @ApiResponse({
    status: 200,
    description: 'Charge found',
    type: Charge,
  })
  @ApiResponse({ status: 404, description: 'Charge not found' })
  findOne(@Param('id') id: string): Promise<Charge> {
    return this.chargesService.findById(id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get charges by customer ID' })
  @ApiResponse({
    status: 200,
    description: 'List of charges for the customer',
    type: [Charge],
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findByCustomer(@Param('customerId') customerId: string): Promise<Charge[]> {
    return this.chargesService.findByCustomerId(customerId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update charge status' })
  @ApiResponse({
    status: 200,
    description: 'Charge status updated',
    type: Charge,
  })
  @ApiResponse({ status: 404, description: 'Charge not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: ChargeStatus): Promise<Charge> {
    return this.chargesService.updateStatus(id, status);
  }
}
