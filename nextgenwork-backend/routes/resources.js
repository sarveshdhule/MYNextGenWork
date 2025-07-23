const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const protect = require('../middleware/auth');

router.get('/', resourceController.getAllResources);
router.get('/mine', protect, resourceController.getMyResources);
router.post('/', protect, resourceController.createResource);
router.delete('/:id', protect, resourceController.deleteResource);
router.patch('/:id/rate', protect, resourceController.rateResource);
router.put('/:id', protect, resourceController.updateResource);

module.exports = router;
