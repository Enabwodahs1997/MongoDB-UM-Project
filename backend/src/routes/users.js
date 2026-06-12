const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Check email uniqueness
router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'email query required' });
    const found = await User.findOne({ email });
    res.json({ exists: !!found });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validation helper
function validateUserPayload(payload) {
  const errors = {};
  if (!payload.name || String(payload.name).trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  const email = payload.email || '';
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) errors.email = 'Invalid email address.';
  return Object.keys(errors).length ? errors : null;
}

// Create user
router.post('/', async (req, res) => {
  try {
    const validation = validateUserPayload(req.body);
    if (validation) return res.status(400).json({ errors: validation });

    // Check uniqueness
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(409).json({ errors: { email: 'Email already in use' } });

    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ errors: { email: 'Email already in use' } });
    res.status(500).json({ error: err.message });
  }
});

// Read all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const validation = validateUserPayload(req.body);
    if (validation) return res.status(400).json({ errors: validation });

    // If email provided, ensure it's not used by another user
    if (req.body.email) {
      const other = await User.findOne({ email: req.body.email });
      if (other && other._id.toString() !== req.params.id) {
        return res.status(409).json({ errors: { email: 'Email already in use' } });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ errors: { email: 'Email already in use' } });
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
