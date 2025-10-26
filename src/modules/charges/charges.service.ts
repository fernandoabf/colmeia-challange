import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IChargeRepository } from './repositories/charge.repository.interface';
import { ICustomerRepository } from '../customers/repositories/customer.repository.interface';
import { PaymentStrategyFactory } from './factories/payment-strategy.factory';
import { CreateChargeDto } from './dto/create-charge.dto';
import { Charge } from './entities/charge.entity';
import { ChargeStatus } from './enums/charge-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { PaymentMetadata } from './types/payment.types';

@Injectable()
export class ChargesService {
  constructor(
    @Inject('IChargeRepository')
    private readonly repository: IChargeRepository,
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly strategyFactory: PaymentStrategyFactory,
  ) {}

  async create(createChargeDto: CreateChargeDto, idempotencyKey?: string): Promise<Charge> {
    // Verificar idempotência
    if (idempotencyKey) {
      const existingCharge = await this.repository.findByIdempotencyKey(idempotencyKey);
      if (existingCharge) {
        return existingCharge;
      }
    }

    // Verificar se cliente existe
    const customer = await this.customerRepository.findById(createChargeDto.customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Criar cobrança no banco
    const charge = await this.repository.create({
      customerId: createChargeDto.customerId,
      amount: createChargeDto.amount,
      currency: createChargeDto.currency || 'BRL',
      paymentMethod: createChargeDto.paymentMethod,
      status: ChargeStatus.PENDING,
      idempotencyKey,
    } as unknown as Record<string, unknown>);

    try {
      // Obter estratégia de pagamento correta via factory
      const strategy = this.strategyFactory.create(createChargeDto.paymentMethod);

      // Preparar dados específicos do método de pagamento
      const paymentMetadata = this.extractPaymentMetadata(createChargeDto);

      // Processar pagamento
      const result = await strategy.process({
        chargeId: charge.id,
        amount: charge.amount as number,
        currency: charge.currency,
        metadata: paymentMetadata,
      });

      // Atualizar status
      await this.repository.updateStatus(charge.id, result.status);

      // Retornar cobrança completa com detalhes do pagamento
      return this.findById(charge.id);
    } catch (error) {
      // Em caso de erro, marcar como failed
      await this.repository.updateStatus(charge.id, ChargeStatus.FAILED);
      throw error;
    }
  }

  async findById(id: string): Promise<Charge> {
    const charge = await this.repository.findById(id);

    if (!charge) {
      throw new NotFoundException('Charge not found');
    }

    return charge;
  }

  async findByCustomerId(customerId: string): Promise<Charge[]> {
    // Verificar se cliente existe
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.repository.findByCustomerId(customerId);
  }

  async updateStatus(id: string, status: ChargeStatus): Promise<Charge> {
    // Verificar se cobrança existe
    await this.findById(id);

    return this.repository.updateStatus(id, status);
  }

  private extractPaymentMetadata(dto: CreateChargeDto): PaymentMetadata {
    switch (dto.paymentMethod) {
      case PaymentMethod.PIX:
        return dto.pixData || {};

      case PaymentMethod.CREDIT_CARD:
        return dto.creditCardData || {};

      case PaymentMethod.BOLETO:
        return dto.boletoData || {};

      default:
        return {};
    }
  }
}
