import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IPaymentStrategy, PaymentData, PaymentResult } from './payment-strategy.interface';
import { PaymentMethod } from '../enums/payment-method.enum';
import { ChargeStatus } from '../enums/charge-status.enum';
import { CreditCardMetadata, GatewayResponse } from '../types/payment.types';

@Injectable()
export class CreditCardStrategy implements IPaymentStrategy {
  constructor(private readonly prisma: PrismaService) {}

  getType(): PaymentMethod {
    return PaymentMethod.CREDIT_CARD;
  }

  async validate(data: PaymentData): Promise<boolean> {
    const cardData = data.metadata as CreditCardMetadata;

    if (!cardData?.cardNumber) {
      throw new BadRequestException('cardNumber is required');
    }

    if (!this.validateCardNumber(cardData.cardNumber)) {
      throw new BadRequestException('Invalid card number (Luhn check failed)');
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      throw new BadRequestException('Invalid CVV');
    }

    if (!this.validateExpiryDate(cardData.expiryMonth, cardData.expiryYear)) {
      throw new BadRequestException('Card is expired or invalid expiry date');
    }

    if (cardData.installments < 1 || cardData.installments > 12) {
      throw new BadRequestException('Installments must be between 1 and 12');
    }

    return true;
  }

  async process(data: PaymentData): Promise<PaymentResult> {
    await this.validate(data);

    const cardData = data.metadata as CreditCardMetadata;

    // Simular processamento com gateway de pagamento
    const gatewayResponse = await this.processWithGateway(data);

    // Salvar apenas dados não sensíveis
    const creditCardPayment = await this.prisma.creditCardPayment.create({
      data: {
        chargeId: data.chargeId,
        cardLast4: cardData.cardNumber.slice(-4),
        installments: cardData.installments || 1,
        brand: this.detectCardBrand(cardData.cardNumber),
        authorizationCode: gatewayResponse.authCode || null,
        transactionId: gatewayResponse.transactionId || null,
      },
    });

    return {
      chargeId: data.chargeId,
      status: gatewayResponse.approved ? ChargeStatus.PAID : ChargeStatus.FAILED,
      paymentDetails: {
        cardLast4: creditCardPayment.cardLast4,
        installments: creditCardPayment.installments,
        brand: creditCardPayment.brand,
        authorizationCode: creditCardPayment.authorizationCode || undefined,
        transactionId: creditCardPayment.transactionId || undefined,
      },
    };
  }

  private validateCardNumber(cardNumber: string): boolean {
    // Algoritmo de Luhn
    const digits = cardNumber.replace(/\D/g, '');

    if (digits.length < 13 || digits.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  private validateExpiryDate(month: string, year: string): boolean {
    const now = new Date();
    const currentYear = now.getFullYear() % 100; // Últimos 2 dígitos
    const currentMonth = now.getMonth() + 1;

    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);

    if (expiryYear < currentYear) {
      return false;
    }

    if (expiryYear === currentYear && expiryMonth < currentMonth) {
      return false;
    }

    return true;
  }

  private detectCardBrand(cardNumber: string): string {
    const patterns: Record<string, RegExp> = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      elo: /^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|6504|6505|6516)/,
    };

    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return brand;
      }
    }

    return 'unknown';
  }

  private async processWithGateway(data: PaymentData): Promise<GatewayResponse> {
    // Simula processamento com gateway de pagamento
    // Em produção, integrar com gateway real (Stripe, PagSeguro, etc.)

    // Simular sucesso para fins de demonstração
    return {
      approved: true,
      authCode: `AUTH${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substring(2, 6)}`,
    };
  }
}
