import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentMethod } from '../enums/payment-method.enum';
import { IPaymentStrategy } from '../strategies/payment-strategy.interface';
import { PixStrategy } from '../strategies/pix.strategy';
import { CreditCardStrategy } from '../strategies/credit-card.strategy';
import { BoletoStrategy } from '../strategies/boleto.strategy';

@Injectable()
export class PaymentStrategyFactory {
  constructor(
    private readonly pixStrategy: PixStrategy,
    private readonly creditCardStrategy: CreditCardStrategy,
    private readonly boletoStrategy: BoletoStrategy,
  ) {}

  create(paymentMethod: PaymentMethod): IPaymentStrategy {
    switch (paymentMethod) {
      case PaymentMethod.PIX:
        return this.pixStrategy;

      case PaymentMethod.CREDIT_CARD:
        return this.creditCardStrategy;

      case PaymentMethod.BOLETO:
        return this.boletoStrategy;

      default:
        throw new BadRequestException(`Unsupported payment method: ${paymentMethod}`);
    }
  }

  getAvailable(): IPaymentStrategy[] {
    return [this.pixStrategy, this.creditCardStrategy, this.boletoStrategy];
  }

  isSupported(paymentMethod: PaymentMethod): boolean {
    try {
      this.create(paymentMethod);
      return true;
    } catch {
      return false;
    }
  }
}
