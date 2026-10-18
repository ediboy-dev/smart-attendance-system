const Registration = require('../models/Registration');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const AnalyticsSummary = require('../models/AnalyticsSummary');

async function recomputeAnalytics(courseCode) {
  const registeredStudents = await Registration.find({ courseCode });

  // Only sessions that have ended count towards the total
  const closedSessions = await Session.find({ courseCode, status: 'closed' }).select('sessionId');
  const closedIds = closedSessions.map((s) => s.sessionId);
  const totalSessions = closedIds.length;

  for (const reg of registeredStudents) {
    // Count attendance only in those same closed sessions,
    // so attended can never be greater than total
    const attended = await Attendance.countDocuments({
      studentId: reg.studentId,
      courseCode,
      sessionId: { $in: closedIds },
    });
    const percent = totalSessions === 0 ? 0 : Math.min(100, (attended / totalSessions) * 100);
    const atRisk = percent < 75;

    await AnalyticsSummary.updateOne(
      { studentId: reg.studentId, courseCode },
      { totalSessions, attendedSessions: attended, attendancePercent: percent, atRisk },
      { upsert: true }
    );
  }
}

module.exports = { recomputeAnalytics };
