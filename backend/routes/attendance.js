const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const haversineDistance = require('../utils/haversine');
const { tokenIssuedAt } = require('../services/qrTokenService');
const { recomputeAnalytics } = require('../services/analyticsService');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// A scan saved offline must be synced within this time of being made.
const OFFLINE_SYNC_LIMIT_MS = 12 * 60 * 60 * 1000;

router.post('/scan', authenticate, authorize('student'), async (req, res) => {
  try {
    const { sessionId, scannedToken, latitude, longitude, offline } = req.body;
    const session = await Session.findOne({ sessionId });

    if (!session || (!offline && session.status !== 'active')) {
      return res.status(404).json({ error: 'Session not found or already closed' });
    }

    // Check 1: token validity
    if (!offline) {
      // Live scan: must be the QR code currently on the lecturer's screen
      const tokenAge = Date.now() - session.tokenUpdatedAt.getTime();
      if (scannedToken !== session.currentToken || tokenAge > 15 * 60 * 1000) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }
    } else {
      // Scan saved while offline: must be a genuine token issued during this session
      const issuedAt = tokenIssuedAt(sessionId, scannedToken);
      const started = session._id.getTimestamp().getTime();
      const ended = session.status === 'active' ? Date.now() : session.tokenUpdatedAt.getTime() + 10000;
      if (issuedAt === null || issuedAt < started - 10000 || issuedAt > ended
          || Date.now() - issuedAt > OFFLINE_SYNC_LIMIT_MS) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }
    }

    // Check 2: geofence compliance (location recorded at the moment of scanning)
    const distance = haversineDistance(
      latitude, longitude, session.geofenceCenter.lat, session.geofenceCenter.lng
    );
    if (distance > session.geofenceRadius) {
      return res.status(400).json({ error: 'Outside geofence boundary' });
    }

    // Check 3: course registration
    const registered = await Registration.findOne({
      studentId: req.user._id, courseCode: session.courseCode,
    });
    if (!registered) {
      return res.status(403).json({ error: 'Not registered for this course' });
    }

    await Attendance.create({
      studentId: req.user._id, sessionId, courseCode: session.courseCode,
      timestamp: new Date(), deviceId: req.headers['x-device-id'] || 'unknown', syncStatus: 'synced',
    });

    // A late offline scan for a session that has already ended: update the percentages
    if (session.status === 'closed') await recomputeAnalytics(session.courseCode);

    res.json({ message: 'Attendance marked successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Attendance already recorded for this session' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
