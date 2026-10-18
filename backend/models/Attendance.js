const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId:  { type: String, required: true },
  courseCode: { type: String, required: true },
  timestamp:  { type: Date, default: Date.now },
  deviceId:   { type: String, required: true },
  syncStatus: { type: String, enum: ['synced', 'pending'], default: 'synced' },
});

// A student can only be marked present once per session
attendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
