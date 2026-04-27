const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (userId, message, type = 'general', metadata = {}) => {
  try {
    const notification = new Notification({
      userId,
      message,
      type,
      ...metadata
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('[NotificationService] Create failed:', error);
    return null;
  }
};

const emitToRoom = (io, room, event, payload) => {
  if (!io || !room) return;
  io.to(room).emit(event, payload);
};

const emitNotification = (io, room, payload) => {
  emitToRoom(io, room, 'notification_event', payload);
};

const notifyUser = async (app, userId, message, type = 'general', metadata = {}) => {
  if (!app || !userId) return;
  const notification = await createNotification(userId, message, type, metadata);
  const io = app.get('io');
  if (io) emitNotification(io, `user_${userId}`, { ...metadata, userId, message, type, timestamp: new Date(), id: notification?._id });
  return notification;
};

const notifyRole = async (app, role, message, type = 'general', metadata = {}) => {
  if (!app || !role) return;
  const io = app.get('io');
  const users = await User.find({ role }).select('_id');
  const payload = { message, type, role, timestamp: new Date(), ...metadata };
  if (io) emitNotification(io, `role_${role}`, payload);
  await Promise.all(users.map(user => createNotification(user._id, message, type, metadata)));
  return payload;
};

const notifyHierarchy = async (app, employeeId, managerId, message, type = 'general', metadata = {}) => {
  const io = app?.get('io');
  if (!app || !employeeId) return;
  const payload = { employeeId, managerId, message, type, timestamp: new Date(), ...metadata };

  // employee always receives own notification
  await notifyUser(app, employeeId, message, type, metadata);

  // manager receives employee notifications if assigned
  if (managerId) {
    await notifyUser(app, managerId, `${message} (Employee activity)`, type, metadata);
    if (io) emitNotification(io, `user_${managerId}`, { ...payload, message: `${message} (Employee activity)` });
  }

  // HR and Admin receive all employee tracking notifications
  await notifyRole(app, 'hr', message, type, metadata);
  await notifyRole(app, 'admin', message, type, metadata);

  return payload;
};

module.exports = {
  createNotification,
  notifyUser,
  notifyRole,
  notifyHierarchy,
  emitNotification
};
