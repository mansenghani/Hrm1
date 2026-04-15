const mongoose = require('mongoose');

const timeTrackSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'employeeModel'
  },
  employeeModel: {
    type: String,
    required: true,
    enum: ['EmployeeUser', 'Manager', 'HR', 'Admin']
  },
  employeeRole: {
    type: String,
    required: true,
    enum: ['employee', 'manager', 'hr', 'admin']
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    default: null
  },
  date: {
    type: String, // YYYY-MM-DD format for easy querying
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  activeTime: {
    type: Number, // in seconds
    default: 0
  },
  idleTime: {
    type: Number, // in seconds
    default: 0
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'idle', 'completed'],
    default: 'active'
  },
  // Activity log for detailed tracking
  activityLog: [{
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['mouse', 'keyboard', 'tab', 'resume', 'idle_start'] }
  }]
}, { timestamps: true });

// Index for fast lookups
timeTrackSchema.index({ employeeId: 1, date: 1 });
timeTrackSchema.index({ managerId: 1, date: 1 });
timeTrackSchema.index({ employeeRole: 1, date: 1 });
timeTrackSchema.index({ status: 1 });

module.exports = mongoose.model('TimeTrack', timeTrackSchema);
