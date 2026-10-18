const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode:    { type: String, required: true, unique: true },
  title:         { type: String, required: true },
  units:         { type: Number, required: true, min: 1, max: 6 },
  level:         { type: Number, enum: [100, 200, 300, 400], required: true },
  semester:      { type: Number, enum: [1, 2], required: true },
  department:    { type: String, enum: ['CS', 'CyberSec', 'IT', 'Shared'], required: true },
  isFacultyWide: { type: Boolean, default: false },
});

module.exports = mongoose.model('Course', courseSchema);
