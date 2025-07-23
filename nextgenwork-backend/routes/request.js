const express = require('express');
const router = express.Router();
const { addRequest, getMyRequests, getOpportunityRequests, deleteRequest } = require('../controllers/requestController');
const protect = require('../middleware/auth');
const upload = require('../middleware/uploadResume');

router.post('/:opportunityId', protect, upload.single('resume'), addRequest);
router.get('/my-requests', protect, getMyRequests);
router.get('/opportunity/:id', protect, getOpportunityRequests);
router.delete('/:requestId', protect, deleteRequest);

module.exports = router;