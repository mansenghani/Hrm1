const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedToHR: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  forwardedToManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedToEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  status: {
    type: String,
    enum: ['created', 'hr_review', 'manager_assigned', 'in_progress', 'completed'],
    default: 'created',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
