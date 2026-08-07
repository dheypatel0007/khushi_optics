const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: 'Dhey Patel' },
  role: { type: String, enum: ['Admin', 'Staff'], default: 'Admin' },
  branchId: { type: String, default: 'BR-01' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true, strict: false });

userSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
