const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  isGroup: { type: Boolean, default: false },
  groupName: { type: String },
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  groupImage: { type: String },
  archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mutedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  unreadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
