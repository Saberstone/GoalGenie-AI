const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  category: {
    type: String,
    enum: ['food', 'travel', 'shopping', 'bills', 'entertainment', 'rent', 'health', 'other'],
    default: 'other',
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema);