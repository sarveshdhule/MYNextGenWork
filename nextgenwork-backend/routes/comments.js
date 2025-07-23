const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/uploadResume');
const { addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const Comment = require('../models/Comment');

// Add comment to an opportunity (with optional resume upload)
router.post('/:opportunityId', protect, upload.single('resume'), addComment);

// Delete comment
router.delete('/:commentId', protect, deleteComment);

// Secure resume download route
router.get('/resume/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId).populate('opportunity');
    if (!comment || !comment.resumePath) return res.status(404).json({ message: 'Resume not found' });

    // Only the commenter or the opportunity owner can access
    // Adjust 'postedBy' and 'user' as per your schema
    const isCommenter = comment.postedBy
      ? comment.postedBy.toString() === req.user.id
      : comment.user && comment.user.toString() === req.user.id;
    const isOpportunityOwner = comment.opportunity && comment.opportunity.postedBy
      ? comment.opportunity.postedBy.toString() === req.user.id
      : false;

    if (!isCommenter && !isOpportunityOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.sendFile(path.resolve(comment.resumePath));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

module.exports = router;