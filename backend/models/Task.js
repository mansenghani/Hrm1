const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: String,
  employeeRole: String,
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  teamId: String,
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Ongoing', 'Review', 'Need to Improve'],
    default: 'Ongoing'
  },
  progressNote: {
    type: String,
    required: false // Only required on update/EOD
  },
  timeEstimate: {
    type: String,
    default: ''
  },
  sprintPoints: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userName: String,
    userRole: String,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    reactions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  date: {
    type: String, // YYYY-MM-DD for easy filtering
    default: () => new Date().toISOString().split('T')[0]
  },
  timeLogs: [{
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    employeeName: String,
    duration: Number, // in seconds
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: Date.now },
    notes: String,
    tags: [String]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
