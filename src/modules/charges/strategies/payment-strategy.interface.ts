import { PaymentMethod } from '../enums/payment-method.enum';
import { ChargeStatus } from '../enums/charge-status.enum';
import { PaymentMetadata, PaymentDetails } from '../types/payment.types';

export interface PaymentData {
  chargeId: string;
  amount: number;
  currency: string;
  metadata?: PaymentMetadata;
}

export interface PaymentResult {
  chargeId: string;
  status: ChargeStatus;
  paymentDetails: PaymentDetails;
}

export interface IPaymentStrategy {
  process(data: PaymentData): Promise<PaymentResult>;
  validate(data: PaymentData): Promise<boolean>;
  getType(): PaymentMethod;
}
