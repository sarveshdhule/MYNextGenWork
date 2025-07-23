const Comment = require('../models/Comment');
const Opportunity = require('../models/Opportunity');
const Resource = require('../models/Resource');

// Add a comment to an opportunity
const addComment = async (req, res) => {
  try {
    const { id } = req.params; // opportunity id
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }
    const opportunity = await Opportunity.findById(id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found.' });
    }
    const comment = new Comment({
      opportunity: id,
      user: req.user._id,
      text: text.trim()
    });
    await comment.save();
    await comment.populate('user', 'username email');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment.' });
  }
};

// Get all comments for an opportunity
const getComments = async (req, res) => {
  try {
    const { id } = req.params; // opportunity id
    const comments = await Comment.find({ opportunity: id })
      .populate('user', 'username email')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments.' });
  }
};

// Add a comment to a resource (optionally as a reply)
const addResourceComment = async (req, res) => {
  try {
    const { id } = req.params; // resource id
    const { text, parent } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }
    const comment = new Comment({
      resource: id,
      user: req.user._id,
      text: text.trim(),
      parent: parent || null
    });
    await comment.save();
    await comment.populate('user', 'username email');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment.' });
  }
};

// Get all comments for a resource (threaded)
const getResourceComments = async (req, res) => {
  try {
    const { id } = req.params; // resource id
    // Get all top-level comments for this resource
    const comments = await Comment.find({ resource: id, parent: null })
      .populate('user', 'username email')
      .sort({ createdAt: 1 });
    // For each, get replies
    const commentsWithReplies = await Promise.all(comments.map(async comment => {
      const replies = await Comment.find({ parent: comment._id })
        .populate('user', 'username email')
        .sort({ createdAt: 1 });
      return { ...comment.toObject(), replies };
    }));
    res.json(commentsWithReplies);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments.' });
  }
};

module.exports = {
  addComment,
  getComments,
  addResourceComment,
  getResourceComments
};
