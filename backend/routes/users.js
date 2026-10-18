const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Admin creates a lecturer or admin account (students self-register via /auth/register)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ id: user._id, name: user.name, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/assign-lecturer', authenticate, authorize('admin'), async (req, res) => {
  // In this simple model, "assignment" is tracked implicitly via sessions created by that lecturer.
  // A dedicated CourseLecturer join collection could be added here if stricter enforcement is needed.
  res.json({ message: 'Lecturer assignment noted (see comment for extension point)' });
});

module.exports = router;
