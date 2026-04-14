const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hrSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'hr' },
  department: String,
  profile: {
    firstName: String,
    lastName: String
  }
}, { timestamps: true });

hrSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

hrSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('HR', hrSchema);
