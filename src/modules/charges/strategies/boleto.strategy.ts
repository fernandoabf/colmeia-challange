import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IPaymentStrategy, PaymentData, PaymentResult } from './payment-strategy.interface';
import { PaymentMethod } from '../enums/payment-method.enum';
import { ChargeStatus } from '../enums/charge-status.enum';
import { BoletoMetadata, BoletoData } from '../types/payment.types';

@Injectable()
export class BoletoStrategy implements IPaymentStrategy {
  constructor(private readonly prisma: PrismaService) {}

  getType(): PaymentMethod {
    return PaymentMethod.BOLETO;
  }

  async validate(data: PaymentData): Promise<boolean> {
    const boletoMeta = data.metadata as BoletoMetadata;
    if (!boletoMeta?.dueDate) {
      throw new BadRequestException('dueDate is required for Boleto');
    }

    const dueDate = new Date(boletoMeta.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      throw new BadRequestException('dueDate cannot be in the past');
    }

    return true;
  }

  async process(data: PaymentData): Promise<PaymentResult> {
    await this.validate(data);

    const boletoMeta = data.metadata as BoletoMetadata;
    const dueDate = new Date(boletoMeta.dueDate);

    // Gerar dados do boleto
    const boletoData = this.generateBoleto(data, dueDate);

    // Salvar dados do boleto
    const boletoPayment = await this.prisma.boletoPayment.create({
      data: {
        chargeId: data.chargeId,
        barcodeNumber: boletoData.barcodeNumber,
        dueDate,
        documentUrl: boletoData.documentUrl,
        bankCode: boletoData.bankCode || null,
        bankName: boletoData.bankName || null,
      },
    });

    return {
      chargeId: data.chargeId,
      status: ChargeStatus.PENDING,
      paymentDetails: {
        barcodeNumber: boletoPayment.barcodeNumber,
        dueDate: boletoPayment.dueDate,
        documentUrl: boletoPayment.documentUrl,
        bankCode: boletoPayment.bankCode || undefined,
        bankName: boletoPayment.bankName || undefined,
      },
    };
  }

  private generateBoleto(data: PaymentData, dueDate: Date): BoletoData {
    // Simula geração de boleto
    // Em produção, integrar com API bancária ou provedor de boletos

    // Gerar código de barras (formato simplificado)
    const bankCode = '237'; // Bradesco (exemplo)
    const currencyCode = '9';
    const dueFactor = this.calculateDueFactor(dueDate);
    const amount = Math.round(data.amount * 100)
      .toString()
      .padStart(10, '0');
    const randomField = Math.random().toString().substring(2, 27);

    const barcodeNumber = `${bankCode}${currencyCode}${dueFactor}${amount}${randomField}`;

    // Gerar URL do documento (em produção, seria o PDF gerado)
    const documentUrl = `https://storage.example.com/boletos/${data.chargeId}.pdf`;

    return {
      barcodeNumber,
      documentUrl,
      bankCode,
      bankName: 'Bradesco',
    };
  }

  private calculateDueFactor(dueDate: Date): string {
    // Fator de vencimento: número de dias desde 07/10/1997
    const baseDate = new Date('1997-10-07');
    const diffTime = dueDate.getTime() - baseDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString().padStart(4, '0');
  }
}
