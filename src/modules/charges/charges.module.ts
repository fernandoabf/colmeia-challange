import { Module } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';
import { ChargeRepository } from './repositories/charge.repository';
import { PaymentStrategyFactory } from './factories/payment-strategy.factory';
import { PixStrategy } from './strategies/pix.strategy';
import { CreditCardStrategy } from './strategies/credit-card.strategy';
import { BoletoStrategy } from './strategies/boleto.strategy';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [CustomersModule],
  controllers: [ChargesController],
  providers: [
    ChargesService,
    {
      provide: 'IChargeRepository',
      useClass: ChargeRepository,
    },
    PaymentStrategyFactory,
    PixStrategy,
    CreditCardStrategy,
    BoletoStrategy,
  ],
  exports: [ChargesService, 'IChargeRepository'],
})
export class ChargesModule {}
