const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Session = require('../models/Session');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { generateToken, startRefreshLoop, stopRefreshLoop } = require('../services/qrTokenService');
const { recomputeAnalytics } = require('../services/analyticsService');

router.post('/start', authenticate, authorize('lecturer'), async (req, res) => {
  const { courseCode, geofenceCenter, geofenceRadius } = req.body;

  const registeredCount = await Registration.countDocuments({ courseCode });
  if (registeredCount === 0) {
    return res.status(400).json({ error: 'No students are registered for this course' });
  }

  // Only one live session per course. Any older session left open is handled here:
  // - if nobody scanned into it, it was a false start, so it is deleted and never counts
  // - if at least one student scanned, it was a real class, so it is closed and counted
  const stillOpen = await Session.find({ courseCode, status: 'active' });
  let closedAny = false;
  for (const old of stillOpen) {
    stopRefreshLoop(old.sessionId);
    const scans = await Attendance.countDocuments({ sessionId: old.sessionId });
    if (scans === 0) {
      await Session.deleteOne({ _id: old._id });
    } else {
      old.status = 'closed';
      await old.save();
      closedAny = true;
    }
  }
  if (closedAny) await recomputeAnalytics(courseCode);

  const sessionId = crypto.randomUUID();
  const token = generateToken(sessionId);

  const session = await Session.create({
    sessionId, courseCode, lecturerId: req.user._id,
    currentToken: token, geofenceCenter, geofenceRadius, status: 'active',
  });

  startRefreshLoop(sessionId);
  res.status(201).json(session);
});

router.post('/:sessionId/end', authenticate, authorize('lecturer'), async (req, res) => {
  const session = await Session.findOneAndUpdate(
    { sessionId: req.params.sessionId }, { status: 'closed' }, { new: true }
  );
  if (!session) return res.status(404).json({ error: 'Session not found' });

  stopRefreshLoop(req.params.sessionId);
  await recomputeAnalytics(session.courseCode);

  res.json({ message: 'Session ended and analytics updated', session });
});

// Lecturer polls this to display the live QR code
router.get('/:sessionId/token', authenticate, authorize('lecturer'), async (req, res) => {
  const session = await Session.findOne({ sessionId: req.params.sessionId });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({ token: session.currentToken, status: session.status });
});

module.exports = router;
