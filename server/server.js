// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const CONTACTS_COLLECTION = 'contacts';
const DEFAULT_DB = process.env.DB_NAME || 'test';
const MONGO_URI = process.env.MONGODB_URI || `mongodb://localhost:27017/${DEFAULT_DB}`;
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json()); // body parser

let db;

// Подключаемся к MongoDB и стартуем сервер
async function start() {
  try {
    const client = await MongoClient.connect(MONGO_URI);
    db = client.db(); // используется база из URI
    console.log('Connected to MongoDB:', MONGO_URI);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}


// Вспомогательная валидация
function validateContact(data) {
  const errors = [];
  if (!data) errors.push('Body is required');
  else {
    if (!data.name || typeof data.name !== 'string') errors.push('Field "name" is required (string)');
    if (!data.phone || typeof data.phone !== 'string') errors.push('Field "phone" is required (string)');
  }
  return errors;
}

// GET /contacts - список
app.get('/contacts', async (req, res) => {
  try {
    const docs = await db.collection(CONTACTS_COLLECTION).find({}).toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /contacts/:id - один контакт
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

// POST /contacts - создать
app.post('/contacts', async (req, res) => {
  try {
    const body = req.body;
    const errors = validateContact(body);
    if (errors.length) return res.status(400).json({ errors });

    const insertResult = await db.collection(CONTACTS_COLLECTION).insertOne({
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      address: body.address || null,
      createdAt: new Date()
    });

    const created = await db.collection(CONTACTS_COLLECTION).findOne({ _id: insertResult.insertedId });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /contacts/:id - обновить
app.put('/contacts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const body = req.body;
    // Можно частично обновлять - поэтому не требуем все поля
    const update = {};
    if (body.name) update.name = body.name;
    if (body.phone) update.phone = body.phone;
    if ('email' in body) update.email = body.email;
    if ('address' in body) update.address = body.address;
    if (Object.keys(update).length === 0) return res.status(400).json({ error: 'No fields to update' });

    const result = await db.collection(CONTACTS_COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ error: 'Not found' });
    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /contacts/:id - удалить
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

// Root health
app.get('/', (req, res) => res.send({ ok: true, env: process.env.NODE_ENV || 'development' }));

start();
