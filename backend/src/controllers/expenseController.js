const Expense = require('../models/Expense');

// @desc    Add new expense
// @route   POST /api/expenses
const createExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      category: category || 'other',
      description,
      date: date || Date.now(),
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all expenses for logged-in user
// @route   GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await expense.deleteOne();
    res.status(200).json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createExpense, getExpenses, deleteExpense };