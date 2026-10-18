const express = require('express');
const router = express.Router();
const AnalyticsSummary = require('../models/AnalyticsSummary');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Student: view their own attendance percentages
router.get('/student/:studentId', authenticate, authorize('student'), async (req, res) => {
  if (req.params.studentId !== String(req.user._id)) {
    return res.status(403).json({ error: 'Cannot view another student\'s analytics' });
  }
  const records = await AnalyticsSummary.find({ studentId: req.user._id });
  res.json(records);
});

// Lecturer: view course-level attendance report
router.get('/course/:courseCode', authenticate, authorize('lecturer', 'admin'), async (req, res) => {
  const records = await AnalyticsSummary.find({ courseCode: req.params.courseCode })
    .populate('studentId', 'name matricNo');
  res.json(records);
});

// Admin: faculty-wide analytics, filterable by department/level
router.get('/faculty', authenticate, authorize('admin'), async (req, res) => {
  const records = await AnalyticsSummary.find()
    .populate('studentId', 'name matricNo department level');
  res.json(records);
});

module.exports = router;
