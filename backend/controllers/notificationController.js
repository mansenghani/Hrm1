const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (error) {
    console.error('Get Notifications failed:', error);
    res.status(500).json({ message: 'Unable to fetch notifications', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification read failed:', error);
    res.status(500).json({ message: 'Unable to update notification', error: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read failed:', error);
    res.status(500).json({ message: 'Unable to update notifications', error: error.message });
  }
};
