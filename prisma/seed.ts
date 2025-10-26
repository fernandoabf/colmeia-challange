import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Limpar dados existentes
  await prisma.pixPayment.deleteMany();
  await prisma.creditCardPayment.deleteMany();
  await prisma.boletoPayment.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.customer.deleteMany();

  // Criar clientes de exemplo
  const customer1 = await prisma.customer.create({
    data: {
      name: 'João Silva',
      email: 'joao.silva@email.com',
      document: '12345678901',
      phone: '+5511999999999',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      document: '98765432100',
      phone: '+5511988888888',
    },
  });

  console.log('✅ Customers created');

  // Criar cobranças de exemplo
  const pixCharge = await prisma.charge.create({
    data: {
      customerId: customer1.id,
      amount: 150.5,
      currency: 'BRL',
      paymentMethod: 'PIX',
      status: 'PENDING',
    },
  });

  await prisma.pixPayment.create({
    data: {
      chargeId: pixCharge.id,
      qrCode:
        '00020126580014br.gov.bcb.pix0114example12345520400005303986540150.505802BR5913Payment System6009SAO PAULO62070503***6304',
      qrCodeBase64:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
    },
  });

  const cardCharge = await prisma.charge.create({
    data: {
      customerId: customer2.id,
      amount: 500.0,
      currency: 'BRL',
      paymentMethod: 'CREDIT_CARD',
      status: 'PAID',
    },
  });

  await prisma.creditCardPayment.create({
    data: {
      chargeId: cardCharge.id,
      cardLast4: '1111',
      brand: 'visa',
      installments: 3,
      authorizationCode: 'AUTH123456',
      transactionId: 'TXN1234567890',
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const boletoCharge = await prisma.charge.create({
    data: {
      customerId: customer1.id,
      amount: 250.0,
      currency: 'BRL',
      paymentMethod: 'BOLETO',
      status: 'PENDING',
    },
  });

  await prisma.boletoPayment.create({
    data: {
      chargeId: boletoCharge.id,
      barcodeNumber: '23790000012500000000012345678901234567890123',
      dueDate: tomorrow,
      documentUrl: 'https://storage.example.com/boletos/example.pdf',
      bankCode: '237',
      bankName: 'Bradesco',
    },
  });

  console.log('✅ Charges created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${2} customers created`);
  console.log(`   - ${3} charges created (1 PIX, 1 Credit Card, 1 Boleto)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
