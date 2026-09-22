const Debt = require('../models/Debt');

// @desc    Get all debts with payoff calculations & strategies
// @route   GET /api/debts
// @access  Private
const getDebts = async (req, res, next) => {
  try {
    const debts = await Debt.find({ user: req.user.id }).sort({ remainingBalance: -1 });

    const totalDebt = debts.reduce((sum, d) => sum + d.remainingBalance, 0);
    const totalPrincipal = debts.reduce((sum, d) => sum + d.principalAmount, 0);
    const monthlyEmiTotal = debts.reduce((sum, d) => sum + d.monthlyEmi, 0);

    const enrichedDebts = debts.map((d) => {
      const paid = Math.max(0, d.principalAmount - d.remainingBalance);
      const progress = d.principalAmount > 0 ? Math.min(100, Math.round((paid / d.principalAmount) * 100)) : 0;

      // Estimate payoff months at current EMI
      const monthlyRate = (d.interestRate / 100) / 12;
      let estMonths = 0;
      if (d.monthlyEmi > 0 && d.remainingBalance > 0) {
        if (monthlyRate > 0) {
          // N = -ln(1 - (P*r)/EMI) / ln(1+r)
          const numerator = -Math.log(1 - (d.remainingBalance * monthlyRate) / d.monthlyEmi);
          const denominator = Math.log(1 + monthlyRate);
          estMonths = Math.ceil(numerator / denominator);
        } else {
          estMonths = Math.ceil(d.remainingBalance / d.monthlyEmi);
        }
      }

      // Acceleration simulation (paying +15% EMI)
      const acceleratedEmi = d.monthlyEmi * 1.15;
      let fastMonths = 0;
      if (acceleratedEmi > 0 && monthlyRate > 0) {
        const numFast = -Math.log(1 - (d.remainingBalance * monthlyRate) / acceleratedEmi);
        const denFast = Math.log(1 + monthlyRate);
        fastMonths = Math.ceil(numFast / denFast);
      }

      return {
        ...d.toObject(),
        paidAmount: Math.round(paid * 100) / 100,
        progressPercent: progress,
        estimatedPayoffMonths: isNaN(estMonths) || estMonths <= 0 ? 12 : estMonths,
        acceleratedPayoffMonths: isNaN(fastMonths) || fastMonths <= 0 ? 9 : fastMonths,
        monthsSavedWithBonus: Math.max(1, (isNaN(estMonths) ? 12 : estMonths) - (isNaN(fastMonths) ? 9 : fastMonths)),
      };
    });

    res.json({
      success: true,
      data: enrichedDebts,
      summary: {
        totalDebt: Math.round(totalDebt * 100) / 100,
        totalPrincipal: Math.round(totalPrincipal * 100) / 100,
        monthlyEmiTotal: Math.round(monthlyEmiTotal * 100) / 100,
        activeDebtsCount: debts.filter((d) => d.status === 'active').length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create debt/loan
// @route   POST /api/debts
// @access  Private
const createDebt = async (req, res, next) => {
  try {
    const {
      title,
      lender,
      debtType,
      principalAmount,
      remainingBalance,
      interestRate,
      monthlyEmi,
      dueDateDay,
      startDate,
    } = req.body;

    if (!title || !lender || !principalAmount || !interestRate || !monthlyEmi) {
      return res.status(400).json({ success: false, message: 'Please provide all required debt fields' });
    }

    const debt = await Debt.create({
      user: req.user.id,
      title,
      lender,
      debtType: debtType || 'personal_loan',
      principalAmount: Number(principalAmount),
      remainingBalance: remainingBalance !== undefined ? Number(remainingBalance) : Number(principalAmount),
      interestRate: Number(interestRate),
      monthlyEmi: Number(monthlyEmi),
      dueDateDay: Number(dueDateDay) || 5,
      startDate: startDate ? new Date(startDate) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Loan liability recorded successfully',
      data: debt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record repayment / payment history
// @route   POST /api/debts/:id/pay
// @access  Private
const makeDebtPayment = async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid payment amount' });
    }

    const debt = await Debt.findOne({ _id: req.params.id, user: req.user.id });
    if (!debt) {
      return res.status(404).json({ success: false, message: 'Loan record not found' });
    }

    debt.remainingBalance = Math.max(0, debt.remainingBalance - paymentAmount);
    debt.paymentHistory.push({
      amount: paymentAmount,
      date: new Date(),
      note: note || 'Monthly EMI Payment',
    });

    if (debt.remainingBalance <= 0) {
      debt.status = 'paid_off';
    }

    await debt.save();

    res.json({
      success: true,
      message: debt.status === 'paid_off'
        ? 'Congratulations! This loan has been fully settled and paid off!'
        : `Payment of $${paymentAmount} logged successfully.`,
      data: debt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update debt
// @route   PUT /api/debts/:id
// @access  Private
const updateDebt = async (req, res, next) => {
  try {
    let debt = await Debt.findOne({ _id: req.params.id, user: req.user.id });
    if (!debt) {
      return res.status(404).json({ success: false, message: 'Loan record not found' });
    }

    debt = await Debt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Loan record updated',
      data: debt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete debt
// @route   DELETE /api/debts/:id
// @access  Private
const deleteDebt = async (req, res, next) => {
  try {
    const debt = await Debt.findOne({ _id: req.params.id, user: req.user.id });
    if (!debt) {
      return res.status(404).json({ success: false, message: 'Loan record not found' });
    }

    await debt.deleteOne();

    res.json({
      success: true,
      message: 'Debt liability deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDebts,
  createDebt,
  makeDebtPayment,
  updateDebt,
  deleteDebt,
};
