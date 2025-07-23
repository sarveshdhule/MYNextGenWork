const express = require('express');
const router = express.Router();
const {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunityController');
const protect = require('../middleware/auth');
const upload = require('../middleware/uploadLogo');

const multiUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'pic', maxCount: 1 }
]);

router.get('/', getOpportunities);
router.get('/:id', protect, getOpportunity);
router.post('/', protect, multiUpload, createOpportunity);
router.put('/:id', protect, multiUpload, updateOpportunity);
router.delete('/:id', protect, deleteOpportunity);

module.exports = router;