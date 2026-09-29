const express = require('express');
const router = express.Router();
const { askAdvisor } = require('../controllers/advisorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/ask', protect, askAdvisor);

module.exports = router;