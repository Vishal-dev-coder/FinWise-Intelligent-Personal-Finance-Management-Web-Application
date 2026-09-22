const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide asset or investment name'],
      trim: true,
    },
    symbol: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      required: true,
      enum: ['stocks', 'mutual_funds', 'fixed_deposits', 'gold', 'crypto', 'real_estate', 'others'],
      default: 'stocks',
    },
    investedAmount: {
      type: Number,
      required: [true, 'Please provide total invested amount'],
      min: [0, 'Amount cannot be negative'],
    },
    currentValue: {
      type: Number,
      required: [true, 'Please provide current market value'],
      min: [0, 'Value cannot be negative'],
    },
    units: {
      type: Number,
      default: 1,
    },
    buyPricePerUnit: {
      type: Number,
      default: 0,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investment', investmentSchema);
