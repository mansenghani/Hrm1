const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  teamSize: { type: Number, default: 0 },
  department: { type: String, default: 'Operations' }
}, { timestamps: true });

module.exports = mongoose.model('Manager', managerSchema);
