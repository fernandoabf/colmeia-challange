import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IPaymentStrategy, PaymentData, PaymentResult } from './payment-strategy.interface';
import { PaymentMethod } from '../enums/payment-method.enum';
import { ChargeStatus } from '../enums/charge-status.enum';
import { PixMetadata } from '../types/payment.types';

@Injectable()
export class PixStrategy implements IPaymentStrategy {
  constructor(private readonly prisma: PrismaService) {}

  getType(): PaymentMethod {
    return PaymentMethod.PIX;
  }

  async validate(data: PaymentData): Promise<boolean> {
    if (data.amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const pixData = data.metadata as PixMetadata;
    if (!pixData?.expiresInMinutes) {
      throw new BadRequestException('expiresInMinutes is required for PIX');
    }

    const expiresIn = pixData.expiresInMinutes;
    if (expiresIn < 5 || expiresIn > 1440) {
      throw new BadRequestException('expiresInMinutes must be between 5 and 1440');
    }

    return true;
  }

  async process(data: PaymentData): Promise<PaymentResult> {
    await this.validate(data);

    const pixData = data.metadata as PixMetadata;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (pixData?.expiresInMinutes || 30));

    // Gerar código PIX (EMV QR Code simplificado)
    const pixCode = this.generatePixCode(data);
    const qrCodeBase64 = await this.generateQRCodeImage(pixCode);

    // Salvar dados do PIX
    const pixPayment = await this.prisma.pixPayment.create({
      data: {
        chargeId: data.chargeId,
        qrCode: pixCode,
        qrCodeBase64,
        expiresAt,
      },
    });

    return {
      chargeId: data.chargeId,
      status: ChargeStatus.PENDING,
      paymentDetails: {
        qrCode: pixPayment.qrCode,
        qrCodeBase64: pixPayment.qrCodeBase64,
        expiresAt: pixPayment.expiresAt,
      },
    };
  }

  private generatePixCode(data: PaymentData): string {
    // Implementação simplificada do EMV QR Code para PIX
    // Em produção, usar biblioteca específica ou integração com PSP
    const payload = {
      version: '01',
      initMethod: '12',
      merchantAccountInfo: 'br.gov.bcb.pix',
      merchantName: 'Payment System',
      merchantCity: 'SAO PAULO',
      transactionAmount: data.amount.toFixed(2),
      transactionId: data.chargeId,
    };

    // Formato simplificado (na produção usar formato EMV completo)
    return `00020126580014${payload.merchantAccountInfo}0114${payload.transactionId}520400005303986540${payload.transactionAmount}5802BR5913${payload.merchantName}6009${payload.merchantCity}62070503***6304`;
  }

  private async generateQRCodeImage(pixCode: string): Promise<string> {
    // Simula geração de QR Code em Base64
    // Em produção, usar biblioteca como 'qrcode' ou serviço externo
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`;
  }
}
