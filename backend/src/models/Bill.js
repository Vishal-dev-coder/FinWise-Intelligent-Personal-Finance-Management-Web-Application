const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide bill or subscription title'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide bill amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      enum: ['Utilities', 'Streaming', 'Internet', 'Insurance', 'Rent', 'Fitness', 'Software', 'Credit Card', 'Other'],
      default: 'Utilities',
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly', 'one_time'],
      default: 'monthly',
    },
    dueDate: {
      type: Date,
      required: [true, 'Please specify the next due date'],
    },
    isSubscription: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    autoPay: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      default: 'card',
    },
    lastPaymentDate: {
      type: Date,
    },
    reminderDaysBefore: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);
