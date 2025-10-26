import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './modules/database/database.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ChargesModule } from './modules/charges/charges.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    CustomersModule,
    ChargesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule {}
