const Notification = require('../models/Notification');

const createNotification = async (userId, message, type = 'task') => {
  try {
    const notification = new Notification({
      userId,
      message,
      type
    });
    await notification.save();
    console.log(`[NOTIFICATION] To: ${userId} | Msg: ${message}`);
  } catch (error) {
    console.error('Notification Error:', error);
  }
};

module.exports = { createNotification };
