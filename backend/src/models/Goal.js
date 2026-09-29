const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['house', 'car', 'investment', 'emergency', 'education', 'wedding'],
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
  monthlyContribution: {
    type: Number,
    default: 0,
  },
  targetDate: {
    type: Date,
  },
  priority: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active',
  },
  specificDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Goal', goalSchema);