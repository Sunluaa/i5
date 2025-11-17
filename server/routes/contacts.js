const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');

// GET все контакты
router.get('/', async (req, res) => {
  const contacts = await Contact.find();
  res.json(contacts);
});

// POST добавить
router.post('/', async (req, res) => {
  const c = new Contact(req.body);
  await c.save();
  res.json(c);
});

// DELETE по id
router.delete('/:id', async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ status: 'ok' });
});

module.exports = router;
