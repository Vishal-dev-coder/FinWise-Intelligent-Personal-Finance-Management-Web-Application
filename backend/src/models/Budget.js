const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category for the budget'],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, 'Please provide a budget limit'],
      min: [1, 'Limit must be at least 1'],
    },
    period: {
      type: String,
      enum: ['monthly', 'weekly', 'yearly'],
      default: 'monthly',
    },
    month: {
      type: Number, // 1-12
      default: () => new Date().getMonth() + 1,
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    alertAt50: {
      type: Boolean,
      default: true,
    },
    alertAt80: {
      type: Boolean,
      default: true,
    },
    alertAt100: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Budget', budgetSchema);
