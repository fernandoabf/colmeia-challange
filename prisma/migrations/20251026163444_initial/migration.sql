-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD', 'BOLETO');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "document" VARCHAR(20) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charges" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BRL',
    "payment_method" "PaymentMethod" NOT NULL,
    "status" "ChargeStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "idempotency_key" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pix_payments" (
    "id" TEXT NOT NULL,
    "charge_id" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "qr_code_base64" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pix_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_card_payments" (
    "id" TEXT NOT NULL,
    "charge_id" TEXT NOT NULL,
    "card_last4" VARCHAR(4) NOT NULL,
    "brand" VARCHAR(50) NOT NULL,
    "installments" SMALLINT NOT NULL DEFAULT 1,
    "authorization_code" VARCHAR(50),
    "transaction_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_card_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boleto_payments" (
    "id" TEXT NOT NULL,
    "charge_id" TEXT NOT NULL,
    "barcode_number" VARCHAR(54) NOT NULL,
    "due_date" DATE NOT NULL,
    "document_url" TEXT NOT NULL,
    "bank_code" VARCHAR(3),
    "bank_name" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boleto_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_document_key" ON "customers"("document");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_document_idx" ON "customers"("document");

-- CreateIndex
CREATE UNIQUE INDEX "charges_idempotency_key_key" ON "charges"("idempotency_key");

-- CreateIndex
CREATE INDEX "charges_customer_id_idx" ON "charges"("customer_id");

-- CreateIndex
CREATE INDEX "charges_status_idx" ON "charges"("status");

-- CreateIndex
CREATE INDEX "charges_payment_method_idx" ON "charges"("payment_method");

-- CreateIndex
CREATE INDEX "charges_idempotency_key_idx" ON "charges"("idempotency_key");

-- CreateIndex
CREATE INDEX "charges_created_at_idx" ON "charges"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "pix_payments_charge_id_key" ON "pix_payments"("charge_id");

-- CreateIndex
CREATE INDEX "pix_payments_expires_at_idx" ON "pix_payments"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "credit_card_payments_charge_id_key" ON "credit_card_payments"("charge_id");

-- CreateIndex
CREATE INDEX "credit_card_payments_transaction_id_idx" ON "credit_card_payments"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "boleto_payments_charge_id_key" ON "boleto_payments"("charge_id");

-- CreateIndex
CREATE INDEX "boleto_payments_due_date_idx" ON "boleto_payments"("due_date");

-- CreateIndex
CREATE INDEX "boleto_payments_barcode_number_idx" ON "boleto_payments"("barcode_number");

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pix_payments" ADD CONSTRAINT "pix_payments_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "charges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_payments" ADD CONSTRAINT "credit_card_payments_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "charges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boleto_payments" ADD CONSTRAINT "boleto_payments_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "charges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
