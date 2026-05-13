const mongoose = require('mongoose');

const screenshotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: String,
  role: String,
  imageUrl: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 259200 // 3 days in seconds (3 * 24 * 60 * 60)
  }
}, { timestamps: true });

// Ensure cleanup index is active
screenshotSchema.index({ timestamp: 1 }, { expireAfterSeconds: 259200 });

module.exports = mongoose.model('Screenshot', screenshotSchema);
