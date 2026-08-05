import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Create default sandbox user: johndoe@example.com / 123456
  const passwordHash = await bcrypt.hash('123456', 10);

  const john = await prisma.user.upsert({
    where: { email: 'johndoe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '08031234567',
      passwordHash,
      walletBalance: 50000.00,
    },
  });

  console.log(`✅ Default user created: ${john.email}`);

  // Create default transactions for John Doe
  const existingTxCount = await prisma.transaction.count({ where: { userId: john.id } });

  if (existingTxCount === 0) {
    await prisma.transaction.createMany({
      data: [
        {
          userId: john.id,
          title: 'DSTV Compact Premium Subscription',
          amount: 37000,
          type: 'cable-tv',
          status: 'success',
          date: 'Jul 23, 2026',
          reference: 'TX-839201',
        },
        {
          userId: john.id,
          title: 'Electricity Bill (IKEDC Prepaid)',
          amount: 5000,
          type: 'electricity',
          status: 'success',
          date: 'Jul 22, 2026',
          reference: 'TX-492019',
          token: '4839-2938-1928-3049',
          customerName: 'John Doe',
          address: '14 Kingsway Road, Ikoyi, Lagos',
        },
        {
          userId: john.id,
          title: 'Airtel Data Bundle - 5GB',
          amount: 2200,
          type: 'data',
          status: 'success',
          date: 'Jul 21, 2026',
          reference: 'TX-102948',
          phone: '08129038472',
          operator: 'Airtel',
        },
        {
          userId: john.id,
          title: 'MTN Airtime VTU Recharge',
          amount: 1000,
          type: 'airtime',
          status: 'success',
          date: 'Jul 20, 2026',
          reference: 'TX-928104',
          phone: '08039281029',
          operator: 'MTN',
        },
        {
          userId: john.id,
          title: 'Wallet Funding (Bank Transfer)',
          amount: 20000,
          type: 'funding',
          status: 'success',
          date: 'Jul 19, 2026',
          reference: 'TX-748291',
        },
      ],
    });
    console.log('✅ Default transactions seeded');
  }

  // Create default settings for John Doe
  await prisma.settings.upsert({
    where: { userId: john.id },
    update: {},
    create: {
      userId: john.id,
      transactionLimit: 20000,
      enableBiometrics: true,
      enableNotifications: true,
    },
  });

  // Create welcome notification
  const existingNotifCount = await prisma.notification.count({ where: { userId: john.id } });
  if (existingNotifCount === 0) {
    await prisma.notification.create({
      data: {
        userId: john.id,
        title: 'Welcome to PaySphere, John Doe!',
        body: 'Your utility wallet has been funded with promo credit of ₦50,000.',
        time: 'Just now',
      },
    });
  }

  console.log('🎉 Seed complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
