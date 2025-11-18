require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));


// MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// API
app.use('/api/contacts', require('./routes/contacts'));

// STATIC frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

app.put('/contacts/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const body = req.body;

    // ЛОГИ ДЛЯ ПОНИМАНИЯ
    console.log("PUT DATA:", body);

    const update = {
      name: body.name ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      address: body.address ?? null,
      updatedAt: new Date()
    };

    const result = await db.collection(CONTACTS_COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(result.value);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
