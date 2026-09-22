const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets with actual spent comparison
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const budgets = await Budget.find({ user: userId });

    const monthExpenses = await Transaction.find({
      user: userId,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const categorySpend = {};
    monthExpenses.forEach((t) => {
      const cat = t.category.toLowerCase();
      categorySpend[cat] = (categorySpend[cat] || 0) + t.amount;
    });

    const enrichedBudgets = budgets.map((b) => {
      const spent = categorySpend[b.category.toLowerCase()] || 0;
      const percentage = Math.min(200, Math.round((spent / b.limit) * 100));
      const remaining = Math.max(0, b.limit - spent);

      let status = 'normal';
      if (spent >= b.limit) {
        status = 'exceeded';
      } else if (percentage >= 80) {
        status = 'warning';
      } else if (percentage >= 50) {
        status = 'moderate';
      }

      return {
        ...b.toObject(),
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentage,
        status,
      };
    });

    // Generate smart budget recommendations based on past 30-90 days spending
    const recommendations = [];
    const allExpenses = await Transaction.find({ user: userId, type: 'expense' });
    const historicalSpend = {};
    allExpenses.forEach((t) => {
      historicalSpend[t.category] = (historicalSpend[t.category] || 0) + t.amount;
    });

    Object.entries(historicalSpend).forEach(([cat, total]) => {
      const existing = budgets.find((b) => b.category.toLowerCase() === cat.toLowerCase());
      const suggestedLimit = Math.round((total / 2) * 1.1); // ~monthly + 10% buffer
      if (!existing && suggestedLimit > 50) {
        recommendations.push({
          category: cat,
          suggestedLimit,
          reason: `Based on your recent spending history in ${cat}, setting a target limit will prevent leaks.`,
        });
      }
    });

    res.json({
      success: true,
      data: enrichedBudgets,
      recommendations,
      totalBudgeted: budgets.reduce((sum, b) => sum + b.limit, 0),
      totalSpent: Object.values(categorySpend).reduce((sum, s) => sum + s, 0),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const { category, limit, period, alertAt50, alertAt80, alertAt100 } = req.body;

    if (!category || !limit) {
      return res.status(400).json({ success: false, message: 'Category and limit are required' });
    }

    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category: { $regex: new RegExp(`^${category}$`, 'i') },
    });

    if (existingBudget) {
      return res.status(400).json({ success: false, message: 'A budget for this category already exists.' });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      limit: Number(limit),
      period: period || 'monthly',
      alertAt50: alertAt50 !== undefined ? alertAt50 : true,
      alertAt80: alertAt80 !== undefined ? alertAt80 : true,
      alertAt100: alertAt100 !== undefined ? alertAt100 : true,
    });

    res.status(201).json({
      success: true,
      message: 'Budget limit established successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
