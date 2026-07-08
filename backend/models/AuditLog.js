const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  device: {
    type: String
  },
  browser: {
    type: String
  },
  os: {
    type: String
  },
  status: {
    type: String,
    enum: ['Success', 'Failed', 'Warning'],
    default: 'Success'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
