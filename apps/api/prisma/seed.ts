import path from 'node:path';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaBunSqlite } from 'prisma-adapter-bun-sqlite';
import { hashPassword } from '../src/utils/hash';

// Seed script is run from apps/api directory usually
const dbPath = path.resolve(__dirname, '../dev.db');
const adapter = new PrismaBunSqlite({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Doki database...');

  // 1. Clear existing database entries
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared database tables.');

  const defaultPassword = hashPassword('password123');

  // 2. Seed Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@doki.com',
      name: 'Doki Admin Operator',
      password: defaultPassword,
      role: Role.ADMIN,
    },
  });
  console.log('Seeded admin user.');

  // 3. Seed Target Categories (with IPCC default DOC variables)
  const spentGrain = await prisma.category.create({
    data: { name: 'Spent Grain', doc: 0.17 },
  });
  const coffeePulp = await prisma.category.create({
    data: { name: 'Coffee Pulp', doc: 0.18 },
  });
  const fruitWaste = await prisma.category.create({
    data: { name: 'Fruit & Vegetable Waste', doc: 0.15 },
  });
  const maizeHusks = await prisma.category.create({
    data: { name: 'Maize Husks', doc: 0.20 },
  });
  const animalManure = await prisma.category.create({
    data: { name: 'Animal Manure', doc: 0.13 },
  });

  console.log('Seeded categories.');

  // 4. Seed Real-World Geolocation Profiles in Kenya
  // 5 Sellers
  const sellerA = await prisma.user.create({
    data: {
      email: 'seller.thika@doki.com',
      password: defaultPassword,
      role: Role.SELLER,
      companyName: 'Thika Coffee Millers',
      name: 'Thika Coffee Millers',
      latitude: -1.0333,
      longitude: 37.0667,
      address: 'Garissa Road, Thika',
    },
  });
  const sellerB = await prisma.user.create({
    data: {
      email: 'seller.kiambu@doki.com',
      password: defaultPassword,
      role: Role.SELLER,
      companyName: 'Kiambu Fruit Canning Ltd',
      name: 'Kiambu Fruit Canning Ltd',
      latitude: -1.1667,
      longitude: 36.8333,
      address: 'Kiambu Town Road',
    },
  });
  const sellerC = await prisma.user.create({
    data: {
      email: 'seller.nairobi@doki.com',
      password: defaultPassword,
      role: Role.SELLER,
      companyName: 'Nairobi Brewery Outlet',
      name: 'Nairobi Brewery Outlet',
      latitude: -1.2921,
      longitude: 36.8219,
      address: 'Industrial Area, Nairobi',
    },
  });
  const sellerD = await prisma.user.create({
    data: {
      email: 'seller.nakuru@doki.com',
      password: defaultPassword,
      role: Role.SELLER,
      companyName: 'Nakuru Grain Processing Hub',
      name: 'Nakuru Grain Processing Hub',
      latitude: -0.3031,
      longitude: 36.0800,
      address: 'George Morara Road, Nakuru',
    },
  });
  const sellerE = await prisma.user.create({
    data: {
      email: 'seller.eldoret@doki.com',
      password: defaultPassword,
      role: Role.SELLER,
      companyName: 'Eldoret Dairy Cooperatives',
      name: 'Eldoret Dairy Cooperatives',
      latitude: 0.5143,
      longitude: 35.2697,
      address: 'Uganda Road, Eldoret',
    },
  });

  console.log('Seeded Sellers.');

  // 3 Buyers
  const buyerA = await prisma.user.create({
    data: {
      email: 'buyer.chania@doki.com',
      password: defaultPassword,
      role: Role.BUYER,
      companyName: 'Chania Biogas Energy Plant',
      name: 'Chania Biogas Energy Plant',
      latitude: -1.0125,
      longitude: 37.0910,
      address: 'Del Monte Area, Thika',
    },
  });
  const buyerB = await prisma.user.create({
    data: {
      email: 'buyer.kiambu@doki.com',
      password: defaultPassword,
      role: Role.BUYER,
      companyName: 'Kiambu Organic Feed & Insect Protein Farm',
      name: 'Kiambu Organic Feed & Insect Protein Farm',
      latitude: -1.1550,
      longitude: 36.8500,
      address: 'Kirigiti, Kiambu',
    },
  });
  const buyerC = await prisma.user.create({
    data: {
      email: 'buyer.nairobi@doki.com',
      password: defaultPassword,
      role: Role.BUYER,
      companyName: 'Nairobi Bio-Fuel Co',
      name: 'Nairobi Bio-Fuel Co',
      latitude: -1.3120,
      longitude: 36.8850,
      address: 'Mombasa Road, Nairobi',
    },
  });

  console.log('Seeded Buyers.');

  // 5. Create some pending listings to display on the map
  await prisma.listing.create({
    data: {
      sellerId: sellerA.id,
      categoryId: coffeePulp.id,
      quantity: 2500, // 2.5 tonnes
      moisture: 45.5,
      purity: 98.2,
      status: 'PENDING',
    },
  });
  await prisma.listing.create({
    data: {
      sellerId: sellerB.id,
      categoryId: fruitWaste.id,
      quantity: 4000,
      moisture: 80.0,
      purity: 94.5,
      status: 'PENDING',
    },
  });
  await prisma.listing.create({
    data: {
      sellerId: sellerC.id,
      categoryId: spentGrain.id,
      quantity: 6500,
      moisture: 68.2,
      purity: 99.0,
      status: 'PENDING',
    },
  });
  await prisma.listing.create({
    data: {
      sellerId: sellerD.id,
      categoryId: maizeHusks.id,
      quantity: 1800,
      moisture: 12.0,
      purity: 97.8,
      status: 'PENDING',
    },
  });
  await prisma.listing.create({
    data: {
      sellerId: sellerE.id,
      categoryId: animalManure.id,
      quantity: 5000,
      moisture: 72.0,
      purity: 95.0,
      status: 'PENDING',
    },
  });
  console.log('Seeded pending listings.');

  // 6. Generate historical Completed Transactions (Jan 2026 - Jun 2026)
  // We want to calculate carbon avoidance values based on:
  // Methane Avoided = (qtyKg / 1000) * doc * 0.333
  // CO2e reduced = Methane Avoided * 28
  const transactionsData = [
    // Jan 2026
    { seller: sellerA, buyer: buyerA, category: coffeePulp, quantity: 4500, date: new Date(2026, 0, 15) },
    { seller: sellerC, buyer: buyerC, category: spentGrain, quantity: 6000, date: new Date(2026, 0, 28) },
    // Feb 2026
    { seller: sellerB, buyer: buyerB, category: fruitWaste, quantity: 5500, date: new Date(2026, 1, 10) },
    { seller: sellerD, buyer: buyerA, category: maizeHusks, quantity: 3000, date: new Date(2026, 1, 24) },
    // Mar 2026
    { seller: sellerE, buyer: buyerB, category: animalManure, quantity: 8000, date: new Date(2026, 2, 5) },
    { seller: sellerA, buyer: buyerC, category: coffeePulp, quantity: 5000, date: new Date(2026, 2, 19) },
    // Apr 2026
    { seller: sellerC, buyer: buyerA, category: spentGrain, quantity: 7500, date: new Date(2026, 3, 12) },
    { seller: sellerB, buyer: buyerB, category: fruitWaste, quantity: 6200, date: new Date(2026, 3, 26) },
    // May 2026
    { seller: sellerD, buyer: buyerC, category: maizeHusks, quantity: 4200, date: new Date(2026, 4, 8) },
    { seller: sellerE, buyer: buyerA, category: animalManure, quantity: 9500, date: new Date(2026, 4, 22) },
    // Jun 2026
    { seller: sellerA, buyer: buyerB, category: coffeePulp, quantity: 5200, date: new Date(2026, 5, 2) },
    { seller: sellerC, buyer: buyerC, category: spentGrain, quantity: 8200, date: new Date(2026, 5, 14) },
  ];

  for (const tx of transactionsData) {
    const qtyTonnes = tx.quantity / 1000;
    const methaneAvoided = qtyTonnes * tx.category.doc * 0.333;
    const co2eReduced = methaneAvoided * 28;

    const dbTx = await prisma.transaction.create({
      data: {
        sellerId: tx.seller.id,
        buyerId: tx.buyer.id,
        categoryId: tx.category.id,
        quantity: tx.quantity,
        moisture: 45.0, // default avg
        purity: 97.0, // default avg
        methaneAvoided,
        co2eReduced,
        createdAt: tx.date,
      },
    });

    // Create matching audit logs
    await prisma.auditLog.create({
      data: {
        timestamp: tx.date,
        action: 'TRANSACTION_COMPLETED',
        operator: 'SYSTEM_ROUTER',
        details: JSON.stringify({
          transactionId: dbTx.id,
          sellerName: tx.seller.name,
          buyerName: tx.buyer.name,
          categoryName: tx.category.name,
          quantityKg: tx.quantity,
          methaneAvoidedTonnes: parseFloat(methaneAvoided.toFixed(3)),
          co2eReducedTonnes: parseFloat(co2eReduced.toFixed(3)),
        }),
      },
    });
  }
  console.log('Seeded completed transactions and matching audit logs.');

  // 7. Seed generic initial logs
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_BOOTSTRAP',
      operator: admin.name || 'System',
      details: JSON.stringify({ message: 'Database initialized and seeded with Kenya regional coordinates.' }),
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
