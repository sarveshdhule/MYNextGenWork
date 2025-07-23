const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const protect = require('../middleware/auth');

// Get all notifications
router.get('/', protect, getNotifications);

// Mark a notification as read
router.post('/:id/read', protect, markAsRead);

module.exports = router; 