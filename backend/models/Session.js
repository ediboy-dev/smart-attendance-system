const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId:      { type: String, required: true, unique: true },
  courseCode:     { type: String, required: true },
  lecturerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentToken:   { type: String, required: true },
  tokenUpdatedAt: { type: Date, default: Date.now },
  geofenceCenter: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  geofenceRadius: { type: Number, required: true }, // metres
  status:         { type: String, enum: ['active', 'closed'], default: 'active' },
});

module.exports = mongoose.model('Session', sessionSchema);
