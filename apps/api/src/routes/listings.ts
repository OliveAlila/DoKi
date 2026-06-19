import { GoogleGenAI } from '@google/genai';
import { Router } from 'express';
import prisma from '@/db';
import type { AuthRequest } from '@/middleware/auth';
import { authenticateJWT } from '@/middleware/auth';
import { z } from 'zod';

import { env } from '@/env';

const router = Router();

// Only initialize Gemini if we have a key and aren't strictly simulating
const ai = env.GEMINI_API_KEY && !env.SIMULATE_AI ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;

interface ClassificationResult {
  categoryName?: string;
  confidence?: number;
  moisture?: number;
  purity?: number;
  flaggedContaminants?: string[];
  is_manually_corrected?: boolean;
}

// Zod validation schemas
const classifySchema = z.object({
  image: z.string().min(1, "Visual verification stream (image payload) is required"),
});

const publishListingSchema = z.object({
  categoryId: z.union([z.number(), z.string()]).transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error("Category ID must be a valid number reference");
    return parsed;
  }).refine((val) => val > 0, "Category ID must be a positive integer"),
  quantity: z.union([z.number(), z.string()]).transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error("Feedstock volume quantity must be a valid number");
    return parsed;
  }).refine((val) => val > 0, "Feedstock volume quantity must be positive and greater than zero (no negative weights)"),
  moisture: z.union([z.number(), z.string()]).transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error("Relative Moisture Coefficient must be a valid number");
    return parsed;
  }).refine((val) => val >= 0 && val <= 100, "Relative Moisture Coefficient (RMC) must be between 0 and 100 percent"),
  purity: z.union([z.number(), z.string()]).transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error("Verified Composition Purity Index must be a valid number");
    return parsed;
  }).refine((val) => val >= 0 && val <= 100, "Verified Composition Purity Index (CPI) must be between 0 and 100 percent"),
  is_manually_corrected: z.boolean().optional(),
});

const expressInterestSchema = z.object({
  listingId: z.union([z.number(), z.string()]).transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error("Listing ID must be a valid number reference");
    return parsed;
  }).refine((val) => val > 0, "Listing ID must be a positive integer"),
});

// 1. Camera Classification Flow (POST /api/v1/listings/classify)
router.post('/listings/classify', authenticateJWT, async (req: AuthRequest, res) => {
  const result = classifySchema.safeParse(req.body);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path.join('.') || 'general';
      errors[field] = issue.message;
    });
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  const { image } = result.data;

  try {
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
      return res.status(500).json({ error: 'No categories found in database. Please run seed script.' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    
    let resultJson: ClassificationResult;
    let isManuallyCorrected = false;

    if (env.SIMULATE_AI) {
      // Simulate network payload round-trip
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dataLen = base64Data.length;
      const categoryIndex = dataLen % categories.length;
      const matchedCategory = categories[categoryIndex] || categories[0];
      
      const confidence = parseFloat((0.80 + ((dataLen % 20) / 100)).toFixed(2));
      const moisture = parseFloat((15.0 + (dataLen % 45)).toFixed(1));
      const purity = parseFloat((70.0 + (dataLen % 30)).toFixed(1));
      const flaggedContaminants = dataLen % 7 === 0 ? ['plastic_contamination'] : [];
      
      resultJson = {
        categoryName: matchedCategory?.name || 'Coffee Pulp',
        confidence,
        moisture,
        purity,
        flaggedContaminants,
        is_manually_corrected: false
      };
    } else {
      if (!ai) {
        return res.status(500).json({ error: 'AI Simulation is disabled, but no GEMINI_API_KEY is configured.' });
      }

      // Call Gemini 2.5 Flash API
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-09-2025',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
              { text: `Analyze this image of agricultural waste. Determine the category among: [${categories.map(c => c.name).join(', ')}]. Provide an estimated confidence score between 0 and 1, estimated moisture percentage (e.g., 45.0), estimated purity percentage (e.g., 98.5), and an array of any flagged contaminants. Respond strictly with JSON: { "categoryName": "string", "confidence": number, "moisture": number, "purity": number, "flaggedContaminants": ["string"] }.` }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
        }
      });

      try {
        const responseText = response.text || '';
        const sanitizedText = responseText.replace(/```json|```/g, '').trim();
        resultJson = JSON.parse(sanitizedText);
      } catch (parseError) {
        console.warn('JSON parsing of Gemini response failed, applying robust fallback/regex:', parseError);
        isManuallyCorrected = true;
        const rawText = response.text || '';
        
        const categoryRegex = /"categoryName"\s*:\s*"([^"]+)"/i;
        const confidenceRegex = /"confidence"\s*:\s*([0-9.]+)/;
        const moistureRegex = /"moisture"\s*:\s*([0-9.]+)/;
        const purityRegex = /"purity"\s*:\s*([0-9.]+)/;
        const contaminantsRegex = /"flaggedContaminants"\s*:\s*\[([^\]]*)\]/i;
        
        const catMatch = rawText.match(categoryRegex);
        const confMatch = rawText.match(confidenceRegex);
        const moistMatch = rawText.match(moistureRegex);
        const purityMatch = rawText.match(purityRegex);
        const contMatch = rawText.match(contaminantsRegex);
        
        let flaggedContaminants: string[] = [];
        if (contMatch && contMatch[1]) {
          flaggedContaminants = contMatch[1]
            .split(',')
            .map(s => s.replace(/"/g, '').trim())
            .filter(Boolean);
        }

        let parsedConfidence = (confMatch && confMatch[1]) ? parseFloat(confMatch[1]) : 0.85;
        if (isNaN(parsedConfidence) || parsedConfidence < 0 || parsedConfidence > 1) {
          parsedConfidence = 0.85;
        }

        let parsedMoisture = (moistMatch && moistMatch[1]) ? parseFloat(moistMatch[1]) : 45.0;
        if (isNaN(parsedMoisture) || parsedMoisture < 0 || parsedMoisture > 100) {
          parsedMoisture = 45.0;
        }

        let parsedPurity = (purityMatch && purityMatch[1]) ? parseFloat(purityMatch[1]) : 95.0;
        if (isNaN(parsedPurity) || parsedPurity < 0 || parsedPurity > 100) {
          parsedPurity = 95.0;
        }

        let matchedCatName = 'Coffee Pulp';
        if (catMatch && catMatch[1]) {
          const matchedText = catMatch[1].trim();
          const matchesAnyDb = categories.find(c => c.name.toLowerCase() === matchedText.toLowerCase());
          if (matchesAnyDb) {
            matchedCatName = matchesAnyDb.name;
          } else {
            matchedCatName = categories[0]?.name || 'Coffee Pulp';
          }
        } else {
          matchedCatName = categories[0]?.name || 'Coffee Pulp';
        }

        resultJson = {
          categoryName: matchedCatName,
          confidence: parsedConfidence,
          moisture: parsedMoisture,
          purity: parsedPurity,
          flaggedContaminants,
        };
      }
    }

    let matchedCategory = categories.find(c => c.name.toLowerCase() === resultJson.categoryName?.toLowerCase());
    if (!matchedCategory) {
      matchedCategory = categories[0];
    }
    if (!matchedCategory) {
      return res.status(500).json({ error: 'No categories available' });
    }

    res.json({
      categoryId: matchedCategory.id,
      categoryName: matchedCategory.name,
      confidence: resultJson.confidence ?? 0.85,
      moisture: resultJson.moisture ?? 40.0,
      purity: resultJson.purity ?? 95.0,
      flaggedContaminants: resultJson.flaggedContaminants || [],
      is_manually_corrected: isManuallyCorrected || resultJson.is_manually_corrected || false,
    });
  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ error: 'Failed to classify image' });
  }
});

// 2. Publish a listing (POST /api/v1/listings)
router.post('/listings', authenticateJWT, async (req: AuthRequest, res) => {
  const role = req.user?.role;
  if (role !== 'SELLER') {
    return res.status(403).json({ error: 'Only sellers can publish listings' });
  }

  const sellerId = req.user?.userId;
  if (!sellerId) {
    return res.status(401).json({ error: 'Unauthorized: Missing operator profile' });
  }

  const result = publishListingSchema.safeParse(req.body);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path.join('.') || 'general';
      errors[field] = issue.message;
    });
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  const { categoryId, quantity, moisture, purity, is_manually_corrected } = result.data;

  try {
    const seller = await prisma.user.findUnique({ where: { id: sellerId } });
    const category = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!seller || !category) {
      return res.status(404).json({ error: 'Seller or Category not found' });
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId: sellerId,
        categoryId: categoryId,
        quantity: quantity,
        moisture: moisture,
        purity: purity,
        status: 'PENDING',
      },
    });

    // Create an Audit Log for this publishing operation
    await prisma.auditLog.create({
      data: {
        action: 'LISTING_PUBLISHED',
        operator: seller.name || seller.email,
        details: JSON.stringify({
          listingId: listing.id,
          categoryName: category.name,
          quantityKg: quantity,
          moisturePercent: moisture,
          purityPercent: purity,
          is_manually_corrected: is_manually_corrected || false,
        }),
      },
    });

    res.status(201).json({ message: 'Listing published successfully', listing });
  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ error: 'Internal server error while publishing listing' });
  }
});

// 3. Fetch active listings & buyers/sellers for Maps (GET /api/v1/listings)
router.get('/listings', async (_req, res) => {
  try {
    const activeListings = await prisma.listing.findMany({
      where: { status: 'PENDING' },
      include: {
        seller: true,
        category: true,
      },
    });

    const buyers = await prisma.user.findMany({ where: { role: 'BUYER' } });
    const sellers = await prisma.user.findMany({
      where: { role: 'SELLER' },
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
    console.error('Fetch listings error:', error);
    res.status(500).json({ error: 'Internal server error fetching listings' });
  }
});

// 4. Real-time Impact Scorecard & Trends (GET /api/v1/dashboard/stats)
router.get('/dashboard/stats', authenticateJWT, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin clearance required' });
  }
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap: { [key: string]: number } = {};

    const today = new Date();
    const trendData: { name: string; value: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mName = months[d.getMonth()] as string;
      monthlyDataMap[mName] = 0;
      trendData.push({ name: mName, value: 0 });
    }

    transactions.forEach((t) => {
      const tDate = new Date(t.createdAt);
      const mName = months[tDate.getMonth()] as string;
      if (mName && monthlyDataMap[mName] !== undefined) {
        monthlyDataMap[mName] += t.quantity / 1000; // Waste Diverted in Tonnes
      }
    });

    const finalTrendData = trendData.map((item) => ({
      name: item.name,
      value: parseFloat((monthlyDataMap[item.name] || 0).toFixed(2)),
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
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error loading dashboard stats' });
  }
});

// 5. Live Audit Ledger Table (GET /api/v1/transactions)
router.get('/transactions', authenticateJWT, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin clearance required' });
  }
  try {
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    res.json(auditLogs);
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ error: 'Internal server error fetching transactions' });
  }
});

// 6. Fetch specific listing by ID (GET /api/v1/listings/:id)
router.get('/listings/:id', async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        seller: true,
        category: true,
      },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Fetch listing by ID error:', error);
    res.status(500).json({ error: 'Internal server error fetching listing' });
  }
});

// 7. Express Sourcing Interest (POST /api/v1/transactions/interest)
router.post('/transactions/interest', authenticateJWT, async (req: AuthRequest, res) => {
  const role = req.user?.role;
  if (role !== 'BUYER') {
    return res.status(403).json({ error: 'Only buyers can express interest' });
  }

  const buyerId = req.user?.userId;
  if (!buyerId) {
    return res.status(401).json({ error: 'Unauthorized: Missing operator profile' });
  }

  const result = expressInterestSchema.safeParse(req.body);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path.join('.') || 'general';
      errors[field] = issue.message;
    });
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  const { listingId } = result.data;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { category: true },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Listing is no longer available' });
    }

    // IPCC Tier 1 Math for environmental footprint estimation
    const qtyTonnes = listing.quantity / 1000;
    const methaneAvoided = qtyTonnes * listing.category.doc * 0.333;
    const co2eReduced = methaneAvoided * 28;

    // Update listing status to IN_TRANSIT
    const updatedListing = await prisma.listing.update({
      where: { id: listing.id },
      data: { status: 'IN_TRANSIT' },
    });

    // Create a transaction record
    const transaction = await prisma.transaction.create({
      data: {
        sellerId: listing.sellerId,
        buyerId: buyerId,
        categoryId: listing.categoryId,
        quantity: listing.quantity,
        moisture: listing.moisture,
        purity: listing.purity,
        methaneAvoided: parseFloat(methaneAvoided.toFixed(3)),
        co2eReduced: parseFloat(co2eReduced.toFixed(3)),
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'TRANSACTION_INTEREST_LOGGED',
        operator: 'Buyer',
        details: JSON.stringify({
          listingId: listing.id,
          transactionId: transaction.id,
          buyerId,
        }),
      },
    });

    res.status(201).json({ message: 'Interest expressed successfully', transaction, listing: updatedListing });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ error: 'Internal server error while expressing interest' });
  }
});

// 8. Fetch Buyer Specific Transactions for ESG Scorecard (GET /api/v1/buyer/transactions)
router.get('/buyer/transactions', authenticateJWT, async (req: AuthRequest, res) => {
  const buyerId = req.user?.userId;
  const role = req.user?.role;

  if (role !== 'BUYER') {
    return res.status(403).json({ error: 'Forbidden: Buyer clearance required' });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: { buyerId },
      include: {
        category: true,
        seller: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transactions);
  } catch (error) {
    console.error('Fetch buyer transactions error:', error);
    res.status(500).json({ error: 'Internal server error fetching buyer transactions' });
  }
});

export default router;
