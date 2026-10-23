const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Himanshu:6WJPglqi7y7ckxxV@backendleaning.6k6a9ei.mongodb.net/';
const DB_NAME = process.env.DB_NAME || 'potato';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
  }
  await cachedClient.connect();
  cachedDb = cachedClient.db(DB_NAME);
  return cachedDb;
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const {
        name,
        phone,
        address,
        senderOnParcel,
        selectedGiftIds,
        selectedGiftsSummary,
        chosenGiftsList,
        chosenAllGifts,
        totalGiftsChosen
      } = req.body || {};

      if (!name || !phone || !address) {
        return res.status(400).json({
          success: false,
          error: 'Missing required delivery fields (name, phone, address)'
        });
      }

      const db = await connectToDatabase();
      const doc = {
        name: String(name).trim(),
        phone: String(phone).trim(),
        address: String(address).trim(),
        senderOnParcel: senderOnParcel ? String(senderOnParcel).trim() : 'Not specified',
        selectedGiftIds: Array.isArray(selectedGiftIds) ? selectedGiftIds : [],
        selectedGiftsSummary: selectedGiftsSummary || 'Birthday Surprise Gift 🎁',
        chosenGiftsList: Array.isArray(chosenGiftsList) ? chosenGiftsList : [],
        chosenAllGifts: Boolean(chosenAllGifts),
        totalGiftsChosen: Number(totalGiftsChosen) || (Array.isArray(selectedGiftIds) ? selectedGiftIds.length : 0),
        createdAt: new Date(),
        status: 'pending_delivery'
      };

      const result = await db.collection('deliveries').insertOne(doc);

      return res.status(201).json({
        success: true,
        message: 'Delivery details saved to MongoDB potato database!',
        orderId: result.insertedId,
        chosenGifts: doc.selectedGiftsSummary
      });
    } catch (err) {
      console.error('Serverless MongoDB error:', err);
      return res.status(500).json({
        success: false,
        error: 'Database save failed',
        details: err.message
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const db = await connectToDatabase();
      const list = await db.collection('deliveries').find({}).sort({ createdAt: -1 }).toArray();
      return res.json({ success: true, count: list.length, deliveries: list });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
