const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  usersCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  permissions: {
    type: Map,
    of: [String],
    default: {}
  },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
