const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  monthlyIncome: {
    type: Number,
    default: 0,
  },
  currentSavings: {
    type: Number,
    default: 0,
  },
  riskProfile: {
    type: String,
    enum: ['conservative', 'moderate', 'aggressive'],
    default: 'moderate',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);