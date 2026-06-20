import path from "node:path";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";
import { hashPassword } from "@/utils/hash";

// Seed script is run from apps/api directory usually
const dbPath = path.resolve(__dirname, "../dev.db");
const adapter = new PrismaBunSqlite({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("Seeding Doki database...");

	// 1. Clear existing database entries
	await prisma.auditLog.deleteMany();
	await prisma.transaction.deleteMany();
	await prisma.listing.deleteMany();
	await prisma.category.deleteMany();
	await prisma.user.deleteMany();

	console.log("Cleared database tables.");

	const defaultPassword = hashPassword("#Default123");

	// 2. Seed Admin User
	const admin = await prisma.user.create({
		data: {
			email: "admin@mail.com",
			name: "Doki Admin Operator",
			password: defaultPassword,
			role: Role.ADMIN,
		},
	});
	console.log("Seeded admin user.");

	// 3. Seed Target Categories (with IPCC default DOC variables)
	const spentGrain = await prisma.category.create({
		data: { name: "Spent Grain", doc: 0.17 },
	});
	const coffeePulp = await prisma.category.create({
		data: { name: "Coffee Pulp", doc: 0.18 },
	});
	const fruitWaste = await prisma.category.create({
		data: { name: "Fruit & Vegetable Waste", doc: 0.15 },
	});
	const maizeHusks = await prisma.category.create({
		data: { name: "Maize Husks", doc: 0.2 },
	});
	const animalManure = await prisma.category.create({
		data: { name: "Animal Manure", doc: 0.13 },
	});

	console.log("Seeded categories.");

	// 4. Seed Real-World Geolocation Profiles in Kenya
	// 5 Sellers
	const sellerA = await prisma.user.create({
		data: {
			email: "seller.thika@doki.com",
			password: defaultPassword,
			role: Role.SELLER,
			companyName: "Thika Coffee Millers",
			name: "Thika Coffee Millers",
			latitude: -1.0333,
			longitude: 37.0667,
			address: "Garissa Road, Thika",
		},
	});
	const sellerB = await prisma.user.create({
		data: {
			email: "seller.kiambu@doki.com",
			password: defaultPassword,
			role: Role.SELLER,
			companyName: "Kiambu Fruit Canning Ltd",
			name: "Kiambu Fruit Canning Ltd",
			latitude: -1.1667,
			longitude: 36.8333,
			address: "Kiambu Town Road",
		},
	});
	const sellerC = await prisma.user.create({
		data: {
			email: "seller.nairobi@doki.com",
			password: defaultPassword,
			role: Role.SELLER,
			companyName: "Nairobi Brewery Outlet",
			name: "Nairobi Brewery Outlet",
			latitude: -1.2921,
			longitude: 36.8219,
			address: "Industrial Area, Nairobi",
		},
	});
	const sellerD = await prisma.user.create({
		data: {
			email: "seller.nakuru@doki.com",
			password: defaultPassword,
			role: Role.SELLER,
			companyName: "Nakuru Grain Processing Hub",
			name: "Nakuru Grain Processing Hub",
			latitude: -0.3031,
			longitude: 36.08,
			address: "George Morara Road, Nakuru",
		},
	});
	const sellerE = await prisma.user.create({
		data: {
			email: "seller.eldoret@doki.com",
			password: defaultPassword,
			role: Role.SELLER,
			companyName: "Eldoret Dairy Cooperatives",
			name: "Eldoret Dairy Cooperatives",
			latitude: 0.5143,
			longitude: 35.2697,
			address: "Uganda Road, Eldoret",
		},
	});

	console.log("Seeded Sellers.");

	// 3 Buyers
	const buyerA = await prisma.user.create({
		data: {
			email: "buyer.chania@doki.com",
			password: defaultPassword,
			role: Role.BUYER,
			companyName: "Chania Biogas Energy Plant",
			name: "Chania Biogas Energy Plant",
			latitude: -1.0125,
			longitude: 37.091,
			address: "Del Monte Area, Thika",
		},
	});
	const buyerB = await prisma.user.create({
		data: {
			email: "buyer.kiambu@doki.com",
			password: defaultPassword,
			role: Role.BUYER,
			companyName: "Kiambu Organic Feed & Insect Protein Farm",
			name: "Kiambu Organic Feed & Insect Protein Farm",
			latitude: -1.155,
			longitude: 36.85,
			address: "Kirigiti, Kiambu",
		},
	});
	const buyerC = await prisma.user.create({
		data: {
			email: "buyer.nairobi@doki.com",
			password: defaultPassword,
			role: Role.BUYER,
			companyName: "Nairobi Bio-Fuel Co",
			name: "Nairobi Bio-Fuel Co",
			latitude: -1.312,
			longitude: 36.885,
			address: "Mombasa Road, Nairobi",
		},
	});

	console.log("Seeded Buyers.");

	// 5. Create some pending listings to display on the map
	await prisma.listing.create({
		data: {
			sellerId: sellerA.id,
			categoryId: coffeePulp.id,
			quantity: 2500, // 2.5 tonnes
			moisture: 45.5,
			purity: 98.2,
			status: "PENDING",
		},
	});
	await prisma.listing.create({
		data: {
			sellerId: sellerB.id,
			categoryId: fruitWaste.id,
			quantity: 4000,
			moisture: 80.0,
			purity: 94.5,
			status: "PENDING",
		},
	});
	await prisma.listing.create({
		data: {
			sellerId: sellerC.id,
			categoryId: spentGrain.id,
			quantity: 6500,
			moisture: 68.2,
			purity: 99.0,
			status: "PENDING",
		},
	});
	await prisma.listing.create({
		data: {
			sellerId: sellerD.id,
			categoryId: maizeHusks.id,
			quantity: 1800,
			moisture: 12.0,
			purity: 97.8,
			status: "PENDING",
		},
	});
	await prisma.listing.create({
		data: {
			sellerId: sellerE.id,
			categoryId: animalManure.id,
			quantity: 5000,
			moisture: 72.0,
			purity: 95.0,
			status: "PENDING",
		},
	});
	console.log("Seeded pending listings.");

	// 6. Generate historical Completed Transactions (Jan 2026 - Jun 2026)
	// We want to calculate carbon avoidance values based on:
	// Methane Avoided = (qtyKg / 1000) * doc * 0.333
	// CO2e reduced = Methane Avoided * 28
	const sellersList = [sellerA, sellerB, sellerC, sellerD, sellerE];
	const buyersList = [buyerA, buyerB, buyerC];
	const categoriesList = [
		spentGrain,
		coffeePulp,
		fruitWaste,
		maizeHusks,
		animalManure,
	];

	const numTransactions = 75;
	const startDate = new Date(2026, 0, 1).getTime();
	const endDate = new Date(2026, 5, 30).getTime();

	for (let i = 0; i < numTransactions; i++) {
		const seller =
			sellersList[Math.floor(Math.random() * sellersList.length)] ||
			sellersList[0];
		const buyer =
			buyersList[Math.floor(Math.random() * buyersList.length)] ||
			buyersList[0];
		const category =
			categoriesList[Math.floor(Math.random() * categoriesList.length)] ||
			categoriesList[0];

		const quantity = Math.floor(Math.random() * 8000) + 1000; // 1000 to 9000 kg
		const moisture = parseFloat((Math.random() * 60 + 20).toFixed(1)); // 20.0 to 80.0%
		const purity = parseFloat((Math.random() * 15 + 85).toFixed(1)); // 85.0 to 100.0%

		const randomDate = new Date(
			startDate + Math.random() * (endDate - startDate),
		);

		const qtyTonnes = quantity / 1000;
		const methaneAvoided = qtyTonnes * category.doc * 0.333;
		const co2eReduced = methaneAvoided * 28;

		const dbTx = await prisma.transaction.create({
			data: {
				sellerId: seller.id,
				buyerId: buyer.id,
				categoryId: category.id,
				quantity,
				moisture,
				purity,
				methaneAvoided,
				co2eReduced,
				createdAt: randomDate,
			},
		});

		// Create matching audit logs
		await prisma.auditLog.create({
			data: {
				timestamp: randomDate,
				action: "TRANSACTION_COMPLETED",
				operator: "SYSTEM_ROUTER",
				details: JSON.stringify({
					transactionId: dbTx.id,
					sellerName: seller.name,
					buyerName: buyer.name,
					categoryName: category.name,
					quantityKg: quantity,
					methaneAvoidedTonnes: parseFloat(methaneAvoided.toFixed(3)),
					co2eReducedTonnes: parseFloat(co2eReduced.toFixed(3)),
				}),
			},
		});
	}
	console.log("Seeded completed transactions and matching audit logs.");

	// 7. Seed generic initial logs
	await prisma.auditLog.create({
		data: {
			action: "SYSTEM_BOOTSTRAP",
			operator: admin.name || "System",
			details: JSON.stringify({
				message:
					"Database initialized and seeded with Kenya regional coordinates.",
			}),
		},
	});

	console.log("Seed completed successfully!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
