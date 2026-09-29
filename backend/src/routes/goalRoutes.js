const express = require('express');
const router = express.Router();
const { createGoal, getGoals, getGoalById, updateGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createGoal);
router.get('/', protect, getGoals);
router.get('/:id', protect, getGoalById);
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);

module.exports = router;