const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const {
  getProfile,
  updateProfile,
  bookmarkOpportunity,
  removeBookmark,
  getBookmarks,
  getMyOpportunities,
  bookmarkResource,
  removeResourceBookmark,
  getResourceBookmarks
} = require('../controllers/userController');
const protect = require('../middleware/auth');

// Profile routes (must be before /:id)
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

// Bookmark routes
router.post('/bookmark/:opportunityId', protect, bookmarkOpportunity);
router.delete('/bookmark/:opportunityId', protect, removeBookmark);
router.get('/bookmarks', protect, getBookmarks);
router.get('/my-opportunities', protect, getMyOpportunities);

// Resource Bookmark routes
router.post('/bookmark-resource/:resourceId', protect, bookmarkResource);
router.delete('/bookmark-resource/:resourceId', protect, removeResourceBookmark);
router.get('/resource-bookmarks', protect, getResourceBookmarks);

// Get user by ID (must be last)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;