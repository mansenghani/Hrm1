const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  employeeId: { type: String, unique: true },
  fullName: String,
  email: String,
  role: String,
  personalEmail: String,
  phone: String,
  gender: { type: String, default: 'Male' },
  dob: Date,
  address: String,
  joinDate: Date,
  employmentType: { type: String, default: 'Full-time' },
  profileImage: { type: String, default: null },
  adharCard: { type: String, default: null },
  bankDetails: { type: String, default: null },
  panCard: { type: String, default: null },
  status: { type: String, default: 'active' },
  position: { type: String, default: 'Associate' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
