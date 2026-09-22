const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide loan/debt name'],
      trim: true,
    },
    lender: {
      type: String,
      required: [true, 'Please provide lender/bank name'],
      trim: true,
    },
    debtType: {
      type: String,
      enum: ['personal_loan', 'home_loan', 'student_loan', 'car_loan', 'credit_card', 'mortgage', 'other'],
      default: 'personal_loan',
    },
    principalAmount: {
      type: Number,
      required: [true, 'Please specify original principal amount'],
    },
    remainingBalance: {
      type: Number,
      required: [true, 'Please specify remaining balance'],
    },
    interestRate: {
      type: Number, // percentage, e.g. 7.5
      required: [true, 'Please specify annual interest rate'],
    },
    monthlyEmi: {
      type: Number,
      required: [true, 'Please specify monthly EMI amount'],
    },
    dueDateDay: {
      type: Number, // day of month 1-31
      default: 5,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'paid_off'],
      default: 'active',
    },
    paymentHistory: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Debt', debtSchema);
