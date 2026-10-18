const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Registration = require('../models/Registration');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.post('/register', authenticate, authorize('student'), async (req, res) => {
  try {
    const { courseCodes, session, semester } = req.body;
    const student = req.user;

    const eligibleCourses = await Course.find({
      courseCode: { $in: courseCodes },
      $or: [{ department: student.department }, { isFacultyWide: true }],
      level: student.level,
      semester,
    });

    if (eligibleCourses.length !== courseCodes.length) {
      return res.status(400).json({ error: 'One or more courses are not valid for your department/level' });
    }

    const records = eligibleCourses.map((c) => ({
      studentId: student._id, courseCode: c.courseCode, session, semester,
    }));

    await Registration.insertMany(records, { ordered: false });
    res.status(201).json({ message: 'Courses registered successfully', count: records.length });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'One or more courses already registered' });
    }
    res.status(500).json({ error: err.message });
  }
});

// A student's own registrations for a given session/semester
router.get('/my-courses', authenticate, authorize('student'), async (req, res) => {
  const { session, semester } = req.query;
  const registrations = await Registration.find({
    studentId: req.user._id, session, semester: Number(semester),
  });
  res.json(registrations);
});

module.exports = router;
