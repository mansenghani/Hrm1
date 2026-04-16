const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  employeeId: { type: String, unique: true },
  position: { type: String, default: 'Associate' },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
