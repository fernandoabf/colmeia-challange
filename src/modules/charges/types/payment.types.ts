import { PixPayment, CreditCardPayment, BoletoPayment } from '@prisma/client';

// Tipos para metadata específica de cada método de pagamento
export interface PixMetadata {
  expiresInMinutes?: number;
}

export interface CreditCardMetadata {
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments: number;
}

export interface BoletoMetadata {
  dueDate: string;
}

export type PaymentMetadata =
  | PixMetadata
  | CreditCardMetadata
  | BoletoMetadata
  | Record<string, unknown>;

// Tipos para detalhes de pagamento
export type PixPaymentDetails = Pick<PixPayment, 'qrCode' | 'qrCodeBase64' | 'expiresAt'>;

export type CreditCardPaymentDetails = Pick<
  CreditCardPayment,
  'cardLast4' | 'installments' | 'brand'
> & {
  authorizationCode?: string;
  transactionId?: string;
};

export type BoletoPaymentDetails = Pick<
  BoletoPayment,
  'barcodeNumber' | 'dueDate' | 'documentUrl'
> & {
  bankCode?: string;
  bankName?: string;
};

export type PaymentDetails = PixPaymentDetails | CreditCardPaymentDetails | BoletoPaymentDetails;

// Tipo para resposta do gateway de pagamento
export interface GatewayResponse {
  approved: boolean;
  authCode: string;
  transactionId: string;
}

// Tipo para dados do boleto gerado
export interface BoletoData {
  barcodeNumber: string;
  documentUrl: string;
  bankCode: string;
  bankName: string;
}
