const mongoose = require('mongoose');

const analyticsSummarySchema = new mongoose.Schema({
  studentId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseCode:        { type: String, required: true },
  totalSessions:     { type: Number, default: 0 },
  attendedSessions:  { type: Number, default: 0 },
  attendancePercent: { type: Number, default: 0 },
  atRisk:            { type: Boolean, default: false },
});

analyticsSummarySchema.index({ studentId: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model('AnalyticsSummary', analyticsSummarySchema);
