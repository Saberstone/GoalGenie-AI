const Goal = require('../models/Goal');

// @desc    Create a new goal
// @route   POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { type, title, targetAmount, currentAmount, monthlyContribution, targetDate, specificDetails } = req.body;

    if (!type || !title || !targetAmount) {
      return res.status(400).json({ message: 'Type, title and target amount are required' });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      type,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      monthlyContribution: monthlyContribution || 0,
      targetDate,
      specificDetails: specificDetails || {},
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all goals for logged-in user
// @route   GET /api/goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single goal by ID
// @route   GET /api/goals/:id
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // নিজের goal ছাড়া অন্য কারো goal দেখতে না পারে সেটা নিশ্চিত করা
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this goal' });
    }

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this goal' });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this goal' });
    }

    await goal.deleteOne();

    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createGoal, getGoals, getGoalById, updateGoal, deleteGoal };