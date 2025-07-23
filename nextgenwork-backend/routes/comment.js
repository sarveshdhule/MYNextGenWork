const express = require('express');
const router = express.Router();
const { addComment, getComments, addResourceComment, getResourceComments } = require('../controllers/commentController');
const protect = require('../middleware/auth');

// Add a comment to an opportunity
router.post('/:id', protect, addComment);
// Get all comments for an opportunity
router.get('/:id', protect, getComments);

// Add a comment to a resource
router.post('/resource/:id', protect, addResourceComment);
// Get all comments for a resource
router.get('/resource/:id', protect, getResourceComments);

module.exports = router; 