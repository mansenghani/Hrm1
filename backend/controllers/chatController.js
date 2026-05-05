const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

exports.createGroup = async (req, res) => {
  try {
    const { name, participants } = req.body;
    const { id: adminId } = req.user;

    const allParticipants = [...new Set([...participants, adminId])];

    const group = new Chat({
      participants: allParticipants,
      isGroup: true,
      groupName: name,
      groupAdmin: adminId
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
};

exports.getAvailableUsers = async (req, res) => {
  try {
    const { id, role } = req.user;
    let query = {};
    const currentUser = await User.findById(id);

    if (role === 'admin') {
      query = { _id: { $ne: id } }; // Admin can chat with anyone except themselves
    } else if (role === 'hr') {
      query = { role: { $in: ['manager', 'employee', 'admin', 'hr'] }, _id: { $ne: id } }; // HR can chat with anyone
    } else if (role === 'manager') {
      query = {
        $or: [
          { role: 'hr' }, // Can chat with HR
          { reportingManager: id } // Can chat with their team
        ],
        _id: { $ne: id }
      };
    } else if (role === 'employee') {
      query = {
        $or: [
          { role: 'hr' }, // Can chat with HR
          { _id: currentUser.reportingManager } // Can chat with their manager
        ],
        _id: { $ne: id }
      };
    }

    // Filter out any broken/legacy accounts without a name
    const finalQuery = {
      ...query,
      name: { $exists: true, $ne: null, $ne: '' }
    };

    const users = await User.find(finalQuery).select('name email employeeId role profileImage isOnline lastActive');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    const { id } = req.user;
    const chats = await Chat.find({ participants: id })
      .populate('participants', 'name email employeeId role profileImage isOnline lastActive')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    const chatsWithUnread = await Promise.all(chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chatId: chat._id,
        receiverId: id,
        status: { $ne: 'seen' }
      });
      return { ...chat.toObject(), unreadCount };
    }));

    res.json(chatsWithUnread);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { id: currentUserId } = req.user;

    // Self-chat: find or create a chat where both participants are the same user
    const isSelfChat = String(userId) === String(currentUserId);

    let chat;
    if (isSelfChat) {
      // Self-chat: strictly 1 participant OR exactly [me, me]
      chat = await Chat.findOne({
        isGroup: false,
        $or: [
          { participants: { $size: 1, $all: [currentUserId] } },
          { participants: [currentUserId, currentUserId] }
        ]
      });
    } else {
      chat = await Chat.findOne({
        isGroup: false,
        participants: { $size: 2, $all: [currentUserId, userId] }
      });
    }

    if (!chat) return res.json([]);

    // For self-chats, mark all messages as seen immediately
    const messages = await Message.find({
      chatId: chat._id,
      deletedFor: { $ne: currentUserId }
    })
      .populate('senderId', 'name profileImage role employeeId')
      .populate({
        path: 'replyTo',
        populate: { path: 'senderId', select: 'name' }
      })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { id: currentUserId } = req.user;

    const chat = await Chat.findOne({ _id: chatId, participants: currentUserId, isGroup: true });
    if (!chat) return res.status(403).json({ message: 'Access denied or group not found' });

    const messages = await Message.find({
      chatId: chat._id,
      deletedFor: { $ne: currentUserId }
    })
      .populate('senderId', 'name profileImage role employeeId')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group messages', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, chatId: bodyChatId, message, fileType: bodyFileType, fileName: bodyFileName, replyTo } = req.body;
    const { id: senderId } = req.user;

    let chat;
    if (bodyChatId) {
      chat = await Chat.findById(bodyChatId);
    } else {
      const isSelfChat = String(senderId) === String(receiverId);
      if (isSelfChat) {
        // Self-chat: strictly 1 participant OR exactly [me, me]
        chat = await Chat.findOne({
          isGroup: false,
          $or: [
            { participants: { $size: 1, $all: [senderId] } },
            { participants: [senderId, senderId] }
          ]
        });
        if (!chat) {
          chat = new Chat({ participants: [senderId], isGroup: false });
          await chat.save();
        }
      } else {
        chat = await Chat.findOne({
          isGroup: false,
          participants: { $size: 2, $all: [senderId, receiverId] }
        });
        if (!chat) {
          chat = new Chat({ participants: [senderId, receiverId] });
          await chat.save();
        }
      }
    }

    const isSelfChat = !chat.isGroup && (String(senderId) === String(receiverId) || chat.participants.length === 1 || (chat.participants.length === 2 && String(chat.participants[0]) === String(chat.participants[1])));
    const initialStatus = isSelfChat ? 'seen' : 'sent';

    const messagesToCreate = [];

    // Handle text message if provided
    if (message && message.trim()) {
      messagesToCreate.push({
        chatId: chat._id,
        senderId,
        receiverId: chat.isGroup ? null : (receiverId || senderId),
        message: message.trim(),
        status: initialStatus,
        replyTo: replyTo || null
      });
    }

    // Handle multiple files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        let fileType = bodyFileType;
        if (!fileType) {
          const ext = file.originalname.split('.').pop().toLowerCase();
          if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) fileType = 'image';
          else if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) fileType = 'video';
          else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) fileType = 'audio';
          else fileType = 'document';
        }
        messagesToCreate.push({
          chatId: chat._id,
          senderId,
          receiverId: chat.isGroup ? null : (receiverId || senderId),
          message: '',
          attachment: `/uploads/${file.filename}`,
          fileType,
          fileName: file.originalname,
          status: initialStatus,
          replyTo: replyTo || null
        });
      });
    }

    if (messagesToCreate.length === 0) {
      return res.status(400).json({ message: 'Empty message' });
    }

    const savedMessages = await Message.insertMany(messagesToCreate);

    // We need to populate senderId for each saved message before emitting
    const populatedMessages = await Message.find({ _id: { $in: savedMessages.map(m => m._id) } })
      .populate('senderId', 'name profileImage role employeeId');

    chat.lastMessage = savedMessages[savedMessages.length - 1]._id;
    await chat.save();

    const io = req.app.get('io');
    if (io) {
      populatedMessages.forEach(msg => {
        if (chat.isGroup) {
          chat.participants.forEach(participantId => {
            io.to(`user_${participantId}`).emit('receive_message', msg);
          });
        } else {
          const isSelfChat = String(senderId) === String(receiverId || senderId);
          if (isSelfChat) {
            io.to(`user_${senderId}`).emit('receive_message', msg);
          } else {
            io.to(`user_${receiverId}`).emit('receive_message', msg);
            io.to(`user_${senderId}`).emit('receive_message', msg);
          }
        }
      });
    }

    res.status(201).json(populatedMessages);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    const { senderId } = req.body;
    const { id: receiverId } = req.user;

    await Message.updateMany(
      { senderId, receiverId, status: { $ne: 'seen' } },
      { $set: { status: 'seen' } }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${senderId}`).emit('messages_seen', { receiverId });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as seen', error: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteType } = req.query; // 'me' or 'everyone'
    const { id: userId } = req.user;

    console.log(`[DELETE] Message ${messageId} type ${deleteType} by user ${userId}`);

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    if (deleteType === 'everyone') {
      if (String(msg.senderId) !== String(userId)) {
        return res.status(403).json({ message: 'You can only delete your own messages for everyone' });
      }
      msg.isDeleted = true;
      msg.message = 'This message was deleted';
      msg.attachment = null;
    } else {
      if (!msg.deletedFor.includes(userId)) {
        msg.deletedFor.push(userId);
      }
    }

    await msg.save();

    const io = req.app.get('io');
    if (io) {
      if (deleteType === 'everyone') {
        io.emit('message_deleted', { messageId, chatId: msg.chatId, deleteType: 'everyone' });
        console.log(`[SOCKET] Broadcast message_deleted (everyone): ${messageId}`);
      } else {
        io.to(`user_${userId}`).emit('message_deleted', { messageId, chatId: msg.chatId, deleteType: 'me' });
        console.log(`[SOCKET] Sent message_deleted (me) to user_${userId}: ${messageId}`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[ERROR] Deleting message:', error);
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
};

exports.toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const { id: userId } = req.user;

    console.log(`[REACT] Message ${messageId} with ${emoji} by user ${userId}`);

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    const existingReactionIndex = msg.reactions.findIndex(r => String(r.userId) === String(userId));

    if (existingReactionIndex >= 0) {
      if (msg.reactions[existingReactionIndex].emoji === emoji) {
        msg.reactions.splice(existingReactionIndex, 1);
        console.log(`[REACT] Removed reaction from message ${messageId}`);
      } else {
        msg.reactions[existingReactionIndex].emoji = emoji;
        console.log(`[REACT] Updated reaction for message ${messageId} to ${emoji}`);
      }
    } else {
      msg.reactions.push({ userId, emoji });
      console.log(`[REACT] Added new reaction to message ${messageId}: ${emoji}`);
    }

    await msg.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('message_reacted', { messageId, reactions: msg.reactions, chatId: msg.chatId });
      console.log(`[SOCKET] Broadcast message_reacted: ${messageId}`);
    }

    res.json(msg.reactions);
  } catch (error) {
    console.error('[ERROR] Toggling reaction:', error);
    res.status(500).json({ message: 'Error toggling reaction', error: error.message });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const { messageId } = req.params;
    console.log(`[PIN] Toggling pin for message ${messageId}`);

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    msg.isPinned = !msg.isPinned;
    await msg.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('message_pinned', { messageId, isPinned: msg.isPinned, chatId: msg.chatId });
      console.log(`[SOCKET] Broadcast message_pinned: ${messageId} (${msg.isPinned})`);
    }

    res.json({ isPinned: msg.isPinned });
  } catch (error) {
    console.error('[ERROR] Toggling pin:', error);
    res.status(500).json({ message: 'Error toggling pin', error: error.message });
  }
};

exports.toggleStar = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { id: userId } = req.user;
    console.log(`[STAR] Toggling star for message ${messageId} by user ${userId}`);

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    const index = msg.starredBy.indexOf(userId);
    if (index > -1) {
      msg.starredBy.splice(index, 1);
    } else {
      msg.starredBy.push(userId);
    }

    await msg.save();
    res.json({ starredBy: msg.starredBy });
  } catch (error) {
    console.error('[ERROR] Toggling star:', error);
    res.status(500).json({ message: 'Error toggling star', error: error.message });
  }
};

exports.forwardMessage = async (req, res) => {
  try {
    const { messageId, receiverIds } = req.body; // receiverIds can be user IDs or chat IDs (for groups)
    const { id: senderId } = req.user;

    console.log(`[FORWARD] Message ${messageId} to ${receiverIds.join(', ')} by user ${senderId}`);

    const originalMsg = await Message.findById(messageId);
    if (!originalMsg) return res.status(404).json({ message: 'Original message not found' });

    const forwardedMessages = [];
    const io = req.app.get('io');

    for (const idToForward of receiverIds) {
      let chat;
      let receiverId = null;

      // Check if it's a group chat or a user ID
      chat = await Chat.findById(idToForward);

      if (chat && chat.isGroup) {
        // Forwarding to a group
      } else {
        // Assume idToForward is a user ID, find or create private chat
        receiverId = idToForward;
        chat = await Chat.findOne({
          isGroup: false,
          participants: { $size: 2, $all: [senderId, receiverId] }
        });

        if (!chat) {
          chat = new Chat({ participants: [senderId, receiverId] });
          await chat.save();
        }
      }

      const newMsg = new Message({
        chatId: chat._id,
        senderId,
        receiverId: receiverId, // null for groups
        message: originalMsg.message,
        attachment: originalMsg.attachment,
        fileType: originalMsg.fileType,
        fileName: originalMsg.fileName,
        status: 'sent'
      });

      await newMsg.save();
      forwardedMessages.push(newMsg);

      if (io) {
        const populated = await Message.findById(newMsg._id).populate('senderId', 'name profileImage role employeeId');
        if (chat.isGroup) {
          io.to(`chat_${chat._id}`).emit('receive_message', populated);
        } else {
          io.to(`user_${receiverId}`).emit('receive_message', populated);
          io.to(`user_${senderId}`).emit('receive_message', populated);
        }
        console.log(`[SOCKET] Sent forwarded message to ${chat.isGroup ? `group chat_${chat._id}` : `user_${receiverId}`}`);
      }
    }

    res.status(201).json(forwardedMessages);
  } catch (error) {
    console.error('[ERROR] Forwarding message:', error);
    res.status(500).json({ message: 'Error forwarding message', error: error.message });
  }
};
