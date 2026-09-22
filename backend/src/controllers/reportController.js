const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Debt = require('../models/Debt');
const Investment = require('../models/Investment');
const Goal = require('../models/Goal');

// @desc    Get detailed multi-dimensional financial report
// @route   GET /api/reports/analytics
// @access  Private
const getFinancialReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, period = 'month' } = req.query;

    const dateFilter = { user: userId };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    } else {
      // Default: Last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      dateFilter.date = { $gte: sixMonthsAgo };
    }

    const [transactions, budgets, debts, investments, goals] = await Promise.all([
      Transaction.find(dateFilter).sort({ date: 1 }),
      Budget.find({ user: userId }),
      Debt.find({ user: userId }),
      Investment.find({ user: userId }),
      Goal.find({ user: userId }),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};
    const paymentMethodTotals = {};
    const moodTotals = {};

    transactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        paymentMethodTotals[t.paymentMethod] = (paymentMethodTotals[t.paymentMethod] || 0) + t.amount;
        moodTotals[t.mood] = (moodTotals[t.mood] || 0) + t.amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

    // Monthly aggregates for trend charts
    const monthlyDataMap = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = {
          month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
          income: 0,
          expense: 0,
          savings: 0,
        };
      }
      if (t.type === 'income') {
        monthlyDataMap[key].income += t.amount;
      } else {
        monthlyDataMap[key].expense += t.amount;
      }
      monthlyDataMap[key].savings = monthlyDataMap[key].income - monthlyDataMap[key].expense;
    });

    const monthlyTrends = Object.values(monthlyDataMap);

    // Budget performance evaluation
    const budgetPerformance = budgets.map((b) => {
      const spent = categoryTotals[b.category] || 0;
      return {
        category: b.category,
        limit: b.limit,
        spent: Math.round(spent * 100) / 100,
        variance: Math.round((b.limit - spent) * 100) / 100,
        utilization: Math.round((spent / b.limit) * 100),
      };
    });

    // Investment summary
    const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
    const totalCurrentInv = investments.reduce((s, i) => s + i.currentValue, 0);

    // Debt summary
    const totalDebt = debts.reduce((s, d) => s + d.remainingBalance, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalIncome: Math.round(totalIncome * 100) / 100,
          totalExpense: Math.round(totalExpense * 100) / 100,
          netSavings: Math.round(netSavings * 100) / 100,
          savingsRate: Math.round(savingsRate * 10) / 10,
          transactionCount: transactions.length,
          totalInvested: Math.round(totalInvested * 100) / 100,
          totalCurrentInv: Math.round(totalCurrentInv * 100) / 100,
          totalDebt: Math.round(totalDebt * 100) / 100,
        },
        categoryBreakdown: Object.entries(categoryTotals).map(([name, value]) => ({
          name,
          value: Math.round(value * 100) / 100,
          percent: totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0,
        })),
        paymentMethodBreakdown: Object.entries(paymentMethodTotals).map(([name, value]) => ({
          name: name.toUpperCase(),
          value: Math.round(value * 100) / 100,
        })),
        moodBreakdown: Object.entries(moodTotals).map(([name, value]) => ({
          name,
          value: Math.round(value * 100) / 100,
        })),
        monthlyTrends,
        budgetPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export financial transactions as CSV
// @route   GET /api/reports/export-csv
// @access  Private
const exportTransactionsCsv = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Mood', 'Recurring', 'Notes'];
    const rows = transactions.map((t) => [
      new Date(t.date).toISOString().split('T')[0],
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category}"`,
      t.amount.toFixed(2),
      t.paymentMethod,
      t.mood || 'neutral',
      t.isRecurring ? 'Yes' : 'No',
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="FinWise_Financial_Report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFinancialReport,
  exportTransactionsCsv,
};
