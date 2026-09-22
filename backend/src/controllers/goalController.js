const Goal = require('../models/Goal');
const User = require('../models/User');

// @desc    Get all savings goals with progress and monthly recommendation
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });

    const enrichedGoals = goals.map((g) => {
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      const percentage = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));

      // Calculate months remaining until deadline
      const now = new Date();
      const target = new Date(g.targetDate);
      const diffTime = target - now;
      const diffMonths = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)));

      const recommendedMonthlySaving = remaining > 0 ? Math.round(remaining / diffMonths) : 0;

      return {
        ...g.toObject(),
        remaining: Math.round(remaining * 100) / 100,
        percentage,
        monthsRemaining: diffMonths,
        recommendedMonthlySaving,
      };
    });

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

    res.json({
      success: true,
      data: enrichedGoals,
      totalTarget,
      totalSaved,
      overallProgress: totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create savings goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, targetDate, category, color } = req.body;

    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({ success: false, message: 'Please provide title, target amount, and deadline' });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      targetDate: new Date(targetDate),
      category: category || 'General',
      color: color || '#10B981',
      isCompleted: Number(currentAmount) >= Number(targetAmount),
      completedAt: Number(currentAmount) >= Number(targetAmount) ? new Date() : null,
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deposit funds into a goal
// @route   POST /api/goals/:id/deposit
// @access  Private
const depositToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const depositAmount = Number(amount);

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please specify a valid deposit amount' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    goal.currentAmount += depositAmount;

    let badgeAwarded = false;
    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
      goal.badgeAwarded = true;
      badgeAwarded = true;

      // Award badge in User model
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          'gamification.badges': {
            id: `goal-${goal._id}`,
            name: `${goal.title} Champion`,
            description: `Fully accomplished ${goal.title} savings milestone of $${goal.targetAmount}!`,
            icon: 'Trophy',
            earnedAt: new Date(),
          },
        },
      });
    }

    await goal.save();

    res.json({
      success: true,
      message: goal.isCompleted
        ? 'Congratulations! You reached your savings goal target!'
        : `Successfully contributed $${depositAmount} towards ${goal.title}!`,
      badgeAwarded,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update savings goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Savings goal updated',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Savings goal removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  depositToGoal,
  updateGoal,
  deleteGoal,
};
