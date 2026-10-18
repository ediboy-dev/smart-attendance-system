const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// List courses eligible for the logged-in student's department/level/semester
router.get('/eligible', authenticate, authorize('student'), async (req, res) => {
  const { semester } = req.query;
  const courses = await Course.find({
    level: req.user.level,
    semester: Number(semester),
    $or: [{ department: req.user.department }, { isFacultyWide: true }],
  });
  res.json(courses);
});

// Admin: list all courses
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const courses = await Course.find().sort({ level: 1, courseCode: 1 });
  res.json(courses);
});

// Admin: create a course
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: edit a course
router.put('/:courseCode', authenticate, authorize('admin'), async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { courseCode: req.params.courseCode }, req.body, { new: true }
  );
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

module.exports = router;
