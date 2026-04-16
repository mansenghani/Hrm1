const mongoose = require('mongoose');

const hrSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  hrId: { type: String, unique: true },
  department: { type: String, default: 'Human Resources' },
  permissions: [{ type: String, default: 'manage_tasks' }]
}, { timestamps: true });

module.exports = mongoose.model('HR', hrSchema);
