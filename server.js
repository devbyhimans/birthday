const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Himanshu:6WJPglqi7y7ckxxV@backendleaning.6k6a9ei.mongodb.net/';
const DB_NAME = process.env.DB_NAME || 'potato';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(path.join(__dirname)));

// MongoDB Connection Pool
let dbClient = null;
let db = null;

async function getDatabase() {
  if (db) return db;
  try {
    if (!dbClient) {
      dbClient = new MongoClient(MONGODB_URI);
    }
    await dbClient.connect();
    db = dbClient.db(DB_NAME);
    console.log(`Connected to MongoDB Atlas: database "${DB_NAME}"`);
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const database = await getDatabase();
    res.json({
      status: 'ok',
      database: database.databaseName,
      connected: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Database not connected',
      error: err.message
    });
  }
});

// POST /api/delivery - Save gift delivery details to potato database
app.post('/api/delivery', async (req, res) => {
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
    } = req.body;

    // Validation
    if (!name || !phone || !address) {
      return res.status(400).json({
        success: false,
        error: 'Missing required delivery fields (name, phone, address)'
      });
    }

    const database = await getDatabase();
    const deliveriesCollection = database.collection('deliveries');

    const deliveryDoc = {
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

    const result = await deliveriesCollection.insertOne(deliveryDoc);

    console.log(`Saved new delivery order for "${deliveryDoc.name}" [ID: ${result.insertedId}] in ${DB_NAME}.deliveries`);
    console.log(`Gifts Chosen: ${deliveryDoc.selectedGiftsSummary}`);

    return res.status(201).json({
      success: true,
      message: `Delivery details saved successfully to ${DB_NAME} database!`,
      orderId: result.insertedId,
      chosenGifts: deliveryDoc.selectedGiftsSummary
    });
  } catch (err) {
    console.error('Error saving delivery to MongoDB:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to save delivery details to database',
      details: err.message
    });
  }
});

// GET /api/deliveries or /orders - View saved deliveries
app.get(['/api/deliveries', '/orders'], async (req, res) => {
  try {
    const database = await getDatabase();
    const list = await database
      .collection('deliveries')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // If accessed via a web browser without format=json, render a beautiful HTML view
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
    if (acceptsHtml && req.query.format !== 'json') {
      const cardsHtml = list.length === 0
        ? '<div style="text-align:center; padding: 40px; color: #888;">No gift orders recorded yet! When Potato submits her details, they will show up here live. ✨</div>'
        : list.map(item => {
            const timeStr = new Date(item.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            const giftsHtml = (item.chosenGiftsList && item.chosenGiftsList.length > 0)
              ? item.chosenGiftsList.map(g => `
                  <div style="background: rgba(255,255,255,0.7); border: 1.5px solid #fed7aa; border-radius: 12px; padding: 10px 14px; margin-top: 8px;">
                    <div style="font-weight: 700; color: #9a3412;">${g.emoji || '🎁'} ${g.title || 'Gift'} (${g.boxLabel || 'Box ' + g.boxId})</div>
                    <div style="font-size: 0.9rem; color: #57534e; margin-top: 4px;">${g.desc || ''}</div>
                  </div>
                `).join('')
              : `<div style="font-weight: 600; color: #9a3412;">${item.selectedGiftsSummary || 'Birthday Gift 🎁'}</div>`;

            return `
              <div style="background: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); padding: 24px; margin-bottom: 24px; border: 2px solid #ffedd5;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px dashed #fed7aa; padding-bottom: 12px; margin-bottom: 16px;">
                  <span style="font-size: 1.35rem; font-weight: 800; color: #c2410c;">👤 ${item.name}</span>
                  <span style="background: #ffedd5; color: #c2410c; padding: 4px 12px; border-radius: 999px; font-weight: 700; font-size: 0.85rem;">${item.chosenAllGifts ? '💖 ALL 4 GIFTS' : (item.totalGiftsChosen + ' GIFTS CHOSEN')}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
                  <div><strong style="color: #78716c;">📞 Phone:</strong> <a href="tel:${item.phone}" style="color: #ea580c; font-weight: 700; text-decoration: none;">${item.phone}</a></div>
                  <div><strong style="color: #78716c;">🏷️ Sender on Parcel:</strong> <span style="color: #0f766e; font-weight: 700;">${item.senderOnParcel || 'Himanshu'}</span></div>
                  <div><strong style="color: #78716c;">🕒 Received (IST):</strong> <span style="color: #44403c;">${timeStr}</span></div>
                </div>
                <div style="background: #fff7ed; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;">
                  <strong style="color: #78716c;">🏠 Flipkart Delivery Address:</strong>
                  <div style="font-size: 1.05rem; font-weight: 600; color: #292524; margin-top: 4px; line-height: 1.4;">${item.address}</div>
                </div>
                <div>
                  <strong style="color: #c2410c;">🎀 Chosen Birthday Gifts:</strong>
                  ${giftsHtml}
                </div>
              </div>
            `;
          }).join('');

      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>🎁 Potato's Gift Orders Dashboard</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fffaf5; margin: 0; padding: 24px; color: #292524; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #ea580c; margin: 0 0 8px 0; font-size: 2rem; }
            .header p { color: #78716c; margin: 0; }
            .btn-raw { display: inline-block; margin-top: 10px; background: #ea580c; color: #fff; padding: 6px 16px; border-radius: 999px; text-decoration: none; font-size: 0.85rem; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 Birthday Gift Deliveries Dashboard 🥔💛</h1>
              <p>Connected to MongoDB Atlas: database <strong>potato</strong> • collection <strong>deliveries</strong></p>
              <a href="/api/deliveries?format=json" class="btn-raw">View Raw JSON</a>
            </div>
            ${cardsHtml}
          </div>
        </body>
        </html>
      `);
    }

    return res.json({
      success: true,
      count: list.length,
      deliveries: list
    });
  } catch (err) {
    console.error('Error fetching deliveries:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve deliveries',
      details: err.message
    });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  try {
    await getDatabase();
  } catch (e) {
    console.warn('Initial MongoDB connection attempt deferred:', e.message);
  }
});

module.exports = app;
