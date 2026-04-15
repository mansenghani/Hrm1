const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  personalEmail: { type: String },
  phone: { type: String },
  gender: { type: String },
  dob: { type: Date },
  address: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  role: { type: String, enum: ['employee', 'manager', 'hr', 'admin'], default: 'employee' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinDate: { type: Date, required: true },
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], default: 'Full-time' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  profileImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
