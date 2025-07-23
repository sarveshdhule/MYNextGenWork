const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const registrationController = require('../controllers/registrationController');

router.post('/order', protect, registrationController.createOrder);
router.post('/:id/register', protect, registrationController.register);
router.get('/my', protect, registrationController.getMyRegistrations);
router.get('/:id/registrations', protect, registrationController.getRegistrationsForOpportunity);

module.exports = router;
