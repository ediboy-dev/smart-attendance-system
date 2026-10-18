const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, maxlength: 100 },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['student', 'lecturer', 'admin'], required: true },
  department: { type: String, enum: ['CS', 'CyberSec', 'IT', null], default: null },
  level:      { type: Number, enum: [100, 200, 300, 400, null], default: null },
  matricNo:   { type: String, default: null },
}, { timestamps: true });

// Hash the password automatically before saving, unless it hasn't changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
