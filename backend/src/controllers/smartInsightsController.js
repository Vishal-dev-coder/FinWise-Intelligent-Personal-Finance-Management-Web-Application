const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Debt = require('../models/Debt');
const Investment = require('../models/Investment');
const Goal = require('../models/Goal');
const Bill = require('../models/Bill');
const User = require('../models/User');
const { calculateHealthScore } = require('../utils/healthScore');
const { generateSmartInsights } = require('../utils/insightsEngine');

// @desc    Get detailed smart insights, no-spend days, and health score
// @route   GET /api/insights
// @access  Private
const getSmartDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const [user, transactions, budgets, debts, investments, goals, bills] = await Promise.all([
      User.findById(userId),
      Transaction.find({ user: userId }).sort({ date: -1 }),
      Budget.find({ user: userId }),
      Debt.find({ user: userId }),
      Investment.find({ user: userId }),
      Goal.find({ user: userId }),
      Bill.find({ user: userId }),
    ]);

    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= startOfMonth && d <= endOfMonth;
    });

    const totalIncome = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0) || (user.monthlyIncome || 5000);

    const totalExpenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const totalDebtBalance = debts.reduce((s, d) => s + d.remainingBalance, 0);
    const monthlyEmiTotal = debts.reduce((s, d) => s + d.monthlyEmi, 0);
    const totalInvestments = investments.reduce((s, i) => s + i.currentValue, 0);
    const emergencyGoal = goals.find((g) => g.category === 'Emergency Fund');
    const emergencyFundSaved = emergencyGoal ? emergencyGoal.currentAmount : 0;

    // 1. Health Score
    const healthScore = calculateHealthScore({
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      monthlySavings: Math.max(0, totalIncome - totalExpenses),
      totalDebts: totalDebtBalance,
      monthlyEmi: monthlyEmiTotal,
      budgets,
      transactions: monthTransactions,
      emergencyFundSaved,
      totalInvestments,
    });

    // 2. Rule-Based Insights
    const smartInsights = generateSmartInsights({
      transactions,
      budgets,
      bills,
      goals,
      monthlyIncome: totalIncome,
    });

    // 3. No-Spend Days Tracker for Current Month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyExpenses = {};
    for (let day = 1; day <= daysInMonth; day++) {
      dailyExpenses[day] = 0;
    }

    monthTransactions.forEach((t) => {
      if (t.type === 'expense') {
        const day = new Date(t.date).getDate();
        dailyExpenses[day] = (dailyExpenses[day] || 0) + t.amount;
      }
    });

    const currentDay = now.getDate();
    const noSpendDaysList = [];
    let noSpendCount = 0;

    for (let day = 1; day <= currentDay; day++) {
      if (dailyExpenses[day] === 0) {
        noSpendDaysList.push(day);
        noSpendCount++;
      }
    }

    // 4. Expense Mood Correlation
    const moodStats = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const mood = t.mood || 'neutral';
        if (!moodStats[mood]) {
          moodStats[mood] = { count: 0, totalAmount: 0 };
        }
        moodStats[mood].count += 1;
        moodStats[mood].totalAmount += t.amount;
      });

    const moodAnalysis = Object.entries(moodStats).map(([mood, stats]) => ({
      mood: mood.charAt(0).toUpperCase() + mood.slice(1),
      count: stats.count,
      total: Math.round(stats.totalAmount * 100) / 100,
      average: Math.round((stats.totalAmount / stats.count) * 100) / 100,
    }));

    // 5. Emergency Fund Assessment
    const targetMonths = 6;
    const recommendedEmergencyFund = totalExpenses > 0 ? totalExpenses * targetMonths : (totalIncome * 0.7) * targetMonths;
    const emergencyFundProgress = Math.min(100, Math.round((emergencyFundSaved / (recommendedEmergencyFund || 1)) * 100));

    // 6. Savings Challenges
    const monthlyChallenges = [
      {
        id: 'no_takeout_weekend',
        title: 'Zero Delivery Weekend Challenge',
        target: 'Cook all meals from Friday dinner to Sunday night',
        potentialSavings: 80,
        rewardBadge: 'Master Chef',
        status: 'active',
      },
      {
        id: 'sub_slash_challenge',
        title: 'Subscription Slash Challenge',
        target: 'Cancel at least 1 unused subscription service this week',
        potentialSavings: 20,
        rewardBadge: 'Frugal Ninja',
        status: 'in_progress',
      },
      {
        id: 'fifty_two_week',
        title: 'Incremental $50 Habit Sprint',
        target: 'Automate $50 transfer into High Yield Savings every Monday',
        potentialSavings: 200,
        rewardBadge: 'Habit Hero',
        status: 'active',
      },
    ];

    res.json({
      success: true,
      data: {
        healthScore,
        smartInsights,
        noSpendTracker: {
          daysInMonth,
          currentDay,
          noSpendCount,
          noSpendDaysList,
          dailyExpenses,
          targetNoSpendDays: 10,
        },
        moodAnalysis,
        emergencyFund: {
          saved: emergencyFundSaved,
          recommended: Math.round(recommendedEmergencyFund),
          monthsTarget: targetMonths,
          progress: emergencyFundProgress,
        },
        gamification: {
          streakDays: user.gamification?.streakDays || 7,
          badges: user.gamification?.badges || [],
          monthlyChallenges,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSmartDashboard,
};
