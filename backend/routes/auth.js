const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, level, matricNo } = req.body;

    // Only students can self-register; lecturer/admin accounts are created by an existing admin
    if (role !== 'student') {
      return res.status(403).json({ error: 'Only student accounts can self-register' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password, role, department, level, matricNo });
    res.status(201).json({ message: 'Account created successfully', userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });

    res.json({
      token,
      user: {
        id: user._id, name: user.name, role: user.role,
        department: user.department, level: user.level,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
