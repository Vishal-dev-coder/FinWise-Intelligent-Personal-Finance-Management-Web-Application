const mongoose = require('mongoose');

const financialTipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide tip title'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Budgeting', 'Saving', 'Investing', 'Debt Management', 'Taxes', 'Psychology of Money', 'Smart Shopping'],
      default: 'Budgeting',
    },
    content: {
      type: String,
      required: [true, 'Please provide tip explanation'],
    },
    actionableAdvice: {
      type: String,
      default: '',
    },
    readingTimeMinutes: {
      type: Number,
      default: 2,
    },
    author: {
      type: String,
      default: 'FinWise Advisory Team',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinancialTip', financialTipSchema);
