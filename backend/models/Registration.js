const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseCode:   { type: String, ref: 'Course', required: true },
  session:      { type: String, required: true },  // e.g. '2025/2026'
  semester:     { type: Number, enum: [1, 2], required: true },
  registeredAt: { type: Date, default: Date.now },
});

// Prevent a student from registering the same course twice in the same semester
registrationSchema.index(
  { studentId: 1, courseCode: 1, session: 1, semester: 1 },
  { unique: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
