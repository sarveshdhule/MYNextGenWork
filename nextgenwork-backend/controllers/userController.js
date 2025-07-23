const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Resource = require('../models/Resource');

// Get Profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Update Profile
const updateProfile = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    await user.save();

    res.json({ message: 'Profile updated', user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
};

// Bookmark Opportunity
const bookmarkOpportunity = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.bookmarks.includes(req.params.opportunityId)) {
      user.bookmarks.push(req.params.opportunityId);
      await user.save();
    }
    res.json({ message: 'Bookmarked' });
  } catch (err) {
    next(err);
  }
};

// Remove Bookmark
const removeBookmark = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.bookmarks = user.bookmarks.filter(
      (id) => id.toString() !== req.params.opportunityId
    );
    await user.save();
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    next(err);
  }
};

// Get Bookmarked Opportunities
const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');
    res.json(user.bookmarks);
  } catch (err) {
    next(err);
  }
};

// Get Opportunities Posted by User
const getMyOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ postedBy: req.user._id });
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posted opportunities' });
  }
};

// Bookmark Resource
const bookmarkResource = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.resourceBookmarks.includes(req.params.resourceId)) {
      user.resourceBookmarks.push(req.params.resourceId);
      await user.save();
    }
    res.json({ message: 'Resource Bookmarked' });
  } catch (err) {
    next(err);
  }
};
// Remove Resource Bookmark
const removeResourceBookmark = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.resourceBookmarks = user.resourceBookmarks.filter(
      (id) => id.toString() !== req.params.resourceId
    );
    await user.save();
    res.json({ message: 'Resource Bookmark removed' });
  } catch (err) {
    next(err);
  }
};
// Get Bookmarked Resources
const getResourceBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('resourceBookmarks');
    res.json(user.resourceBookmarks);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  bookmarkOpportunity,
  removeBookmark,
  getBookmarks,
  getMyOpportunities,
  bookmarkResource,
  removeResourceBookmark,
  getResourceBookmarks
};