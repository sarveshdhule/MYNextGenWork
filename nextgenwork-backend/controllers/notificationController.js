const Notification = require('../models/Notification');

// Internal: Create a notification (used in opportunityController)
const createNotification = async ({ message, opportunity, resource }) => {
  try {
    const notification = new Notification({ message, opportunity, resource });
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

// Get all notifications (for user)
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('opportunity', 'title type')
      .populate('resource', 'title domain')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
};

// Mark a notification as read by the user
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read.' });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead
}; 