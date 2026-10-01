const express = require('express');
const router = express.Router();
const { askAdvisor, getAllocationAdvice } = require('../controllers/advisorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/ask', protect, askAdvisor);
router.post('/allocation', protect, getAllocationAdvice);

module.exports = router;