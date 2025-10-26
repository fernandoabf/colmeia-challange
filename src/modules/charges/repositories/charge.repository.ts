import { Injectable } from '@nestjs/common';
import {
  Charge as PrismaCharge,
  PaymentMethod,
  ChargeStatus as PrismaChargeStatus,
} from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { IChargeRepository, CreateChargeData } from './charge.repository.interface';
import { Charge } from '../entities/charge.entity';
import { ChargeStatus } from '../enums/charge-status.enum';

type ChargeWithRelations = PrismaCharge & {
  pixPayment?: unknown;
  creditCardPayment?: unknown;
  boletoPayment?: unknown;
  customer?: unknown;
};

@Injectable()
export class ChargeRepository extends BaseRepository<Charge> implements IChargeRepository {
  protected modelName = 'charge';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: Record<string, unknown>): Promise<Charge> {
    const charge = await this.prisma.charge.create({
      data: data as Prisma.ChargeCreateInput,
    });

    return this.convertDecimalToNumber(charge) as Charge;
  }

  async findById(id: string): Promise<Charge | null> {
    const charge = await this.prisma.charge.findUnique({
      where: { id },
      include: {
        pixPayment: true,
        creditCardPayment: true,
        boletoPayment: true,
        customer: true,
      },
    });

    if (!charge) return null;
    return this.convertDecimalToNumber(charge) as Charge;
  }

  async findByCustomerId(customerId: string): Promise<Charge[]> {
    const charges = await this.prisma.charge.findMany({
      where: { customerId },
      include: {
        pixPayment: true,
        creditCardPayment: true,
        boletoPayment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return charges.map((charge) => this.convertDecimalToNumber(charge)) as Charge[];
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Charge | null> {
    const charge = await this.prisma.charge.findUnique({
      where: { idempotencyKey },
      include: {
        pixPayment: true,
        creditCardPayment: true,
        boletoPayment: true,
      },
    });

    if (!charge) return null;
    return this.convertDecimalToNumber(charge) as Charge;
  }

  async updateStatus(id: string, status: ChargeStatus): Promise<Charge> {
    const charge = await this.prisma.charge.update({
      where: { id },
      data: { status: status as PrismaChargeStatus },
    });

    return this.convertDecimalToNumber(charge) as Charge;
  }

  private convertDecimalToNumber<T extends { amount: number | { toNumber: () => number } }>(
    data: T,
  ): Omit<T, 'amount'> & { amount: number } {
    return {
      ...data,
      amount: typeof data.amount === 'number' ? data.amount : data.amount.toNumber(),
    };
  }
}
