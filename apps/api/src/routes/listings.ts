import { Router } from 'express';
import prisma from '@/db';

const router = Router();

// 1. Camera Classification Flow (POST /api/v1/listings/classify)
router.post('/listings/classify', async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Image payload is required' });
  }

  try {
    // Simulate processing delay for AI pipeline
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Fetch categories from DB to choose one dynamically
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
      return res.status(500).json({ error: 'No categories found in database. Please run seed script.' });
    }

    // Pick a random category
    const randomIndex = Math.floor(Math.random() * categories.length);
    const category = categories[randomIndex];

    // Generate realistic confidence
    const confidence = parseFloat((0.85 + Math.random() * 0.14).toFixed(4)); // 0.85 to 0.99

    // Generate realistic parameters based on Category Name
    let moisture = 45.0;
    let purity = 98.5;
    let flaggedContaminants: string[] = [];

    switch (category.name) {
      case 'Spent Grain':
        moisture = parseFloat((60 + Math.random() * 15).toFixed(1)); // 60-75%
        purity = parseFloat((95 + Math.random() * 5).toFixed(1));
        break;
      case 'Coffee Pulp':
        moisture = parseFloat((40 + Math.random() * 12).toFixed(1)); // 40-52%
        purity = parseFloat((96 + Math.random() * 4).toFixed(1));
        break;
      case 'Fruit & Vegetable Waste':
        moisture = parseFloat((75 + Math.random() * 15).toFixed(1)); // 75-90%
        purity = parseFloat((90 + Math.random() * 8).toFixed(1));
        if (Math.random() < 0.25) {
          flaggedContaminants.push('Plastic packaging wraps');
        }
        break;
      case 'Maize Husks':
        moisture = parseFloat((10 + Math.random() * 6).toFixed(1)); // 10-16%
        purity = parseFloat((98 + Math.random() * 2).toFixed(1));
        break;
      case 'Animal Manure':
        moisture = parseFloat((65 + Math.random() * 12).toFixed(1)); // 65-77%
        purity = parseFloat((92 + Math.random() * 6).toFixed(1));
        if (Math.random() < 0.2) {
          flaggedContaminants.push('Excessive sand / stones');
        }
        break;
    }

    // Return the classification result
    res.json({
      categoryId: category.id,
      categoryName: category.name,
      confidence,
      moisture,
      purity,
      flaggedContaminants,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to classify image' });
  }
});

// 2. Publish a listing (POST /api/v1/listings)
router.post('/listings', async (req, res) => {
  const { sellerId, categoryId, quantity, moisture, purity } = req.body;

  if (!sellerId || !categoryId || !quantity) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const seller = await prisma.seller.findUnique({ where: { id: parseInt(sellerId) } });
    const category = await prisma.category.findUnique({ where: { id: parseInt(categoryId) } });

    if (!seller || !category) {
      return res.status(404).json({ error: 'Seller or Category not found' });
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId: parseInt(sellerId),
        categoryId: parseInt(categoryId),
        quantity: parseFloat(quantity),
        moisture: parseFloat(moisture || 40.0),
        purity: parseFloat(purity || 95.0),
        status: 'PENDING',
      },
    });

    // Create an Audit Log for this publishing operation
    await prisma.auditLog.create({
      data: {
        action: 'LISTING_PUBLISHED',
        operator: seller.name,
        details: JSON.stringify({
          listingId: listing.id,
          categoryName: category.name,
          quantityKg: quantity,
          moisturePercent: moisture,
          purityPercent: purity,
        }),
      },
    });

    res.status(201).json({ message: 'Listing published successfully', listing });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while publishing listing' });
  }
});

// 3. Fetch active listings & buyers/sellers for Maps (GET /api/v1/listings)
router.get('/listings', async (req, res) => {
  try {
    const activeListings = await prisma.listing.findMany({
      where: { status: 'PENDING' },
      include: {
        seller: true,
        category: true,
      },
    });

    const buyers = await prisma.buyer.findMany();
    const sellers = await prisma.seller.findMany({
      include: {
        listings: {
          where: { status: 'PENDING' },
          include: { category: true }
        }
      }
    });

    res.json({
      listings: activeListings,
      sellers,
      buyers,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching listings' });
  }
});

// 4. Real-time Impact Scorecard & Trends (GET /api/v1/dashboard/stats)
router.get('/dashboard/stats', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { category: true },
    });

    // 1. Total waste diverted in Tonnes
    const totalWeightKg = transactions.reduce((acc, t) => acc + t.quantity, 0);
    const totalWasteDiverted = parseFloat((totalWeightKg / 1000).toFixed(2)); // in Tonnes

    // 2. Methane Avoided (CH4) in Metric Tonnes
    const totalMethaneAvoided = parseFloat(
      transactions.reduce((acc, t) => acc + t.methaneAvoided, 0).toFixed(3)
    );

    // 3. CO2e Reductions (methane * 28)
    const totalCo2eReduced = parseFloat(
      transactions.reduce((acc, t) => acc + t.co2eReduced, 0).toFixed(3)
    );

    // Sparkline Trends - group transaction carbon avoidance by month (last 6 months)
    // We will generate the monthly list dynamically
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap: { [key: string]: number } = {};

    // Initialize last 6 months with 0
    const today = new Date();
    const trendData: { name: string; value: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      monthlyDataMap[mName] = 0;
      trendData.push({ name: mName, value: 0 });
    }

    transactions.forEach((t) => {
      const tDate = new Date(t.createdAt);
      const mName = months[tDate.getMonth()];
      if (monthlyDataMap[mName] !== undefined) {
        monthlyDataMap[mName] += t.quantity / 1000; // Waste Diverted in Tonnes
      }
    });

    // Update values in trendData
    const finalTrendData = trendData.map((item) => ({
      name: item.name,
      value: parseFloat(monthlyDataMap[item.name].toFixed(2)),
    }));

    res.json({
      scorecard: {
        totalWasteDiverted,
        methaneAvoided: totalMethaneAvoided,
        co2eReduced: totalCo2eReduced,
      },
      sparkline: finalTrendData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error loading dashboard stats' });
  }
});

// 5. Live Audit Ledger Table (GET /api/v1/transactions)
router.get('/transactions', async (req, res) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    res.json(auditLogs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching transactions' });
  }
});

export default router;
