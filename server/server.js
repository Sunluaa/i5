require('dotenv').config(); // <-- Подключаем .env

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const CONTACTS_COLLECTION = 'contacts';

// Переменные окружения
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'test';

const app = express();
app.use(cors());
app.use(express.json());

let db; // глобальная ссылка на БД

// --- Подключение к MongoDB ---
async function start() {
  try {
    if (!MONGODB_URI) {
      throw new Error('❌ MONGODB_URI is not set in .env');
    }

    const client = await MongoClient.connect(MONGODB_URI);
    db = client.db(DB_NAME);

    console.log(`✅ Connected to MongoDB: ${DB_NAME}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

// --- Валидация контакта ---
function validateContact(data) {
  const errors = [];
  if (!data) errors.push('Body is required');
  else {
    if (!data.name || typeof data.name !== 'string') errors.push('Field "name" is required (string)');
    if (!data.phone || typeof data.phone !== 'string') errors.push('Field "phone" is required (string)');
  }
  return errors;
}

// --- CRUD маршруты ---

// GET /contacts
app.get('/contacts', async (req, res) => {
  try {
    const docs = await db.collection(CONTACTS_COLLECTION).find({}).toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /contacts/:id
app.get('/contacts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const doc = await db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /contacts
app.post('/contacts', async (req, res) => {
  try {
    const errors = validateContact(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const insertResult = await db.collection(CONTACTS_COLLECTION).insertOne({
      ...req.body,
      createdAt: new Date()
    });

    const created = await db.collection(CONTACTS_COLLECTION).findOne({ _id: insertResult.insertedId });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /contacts/:id
app.put('/contacts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const update = { ...req.body, updatedAt: new Date() };

    const result = await db.collection(CONTACTS_COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ error: 'Not found' });

    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /contacts/:id
app.delete('/contacts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const result = await db.collection(CONTACTS_COLLECTION).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/', (req, res) => res.send({ ok: true, env: process.env.NODE_ENV || 'development' }));

start();
