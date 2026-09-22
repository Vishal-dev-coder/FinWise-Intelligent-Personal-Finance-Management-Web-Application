const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Debt = require('../models/Debt');
const Goal = require('../models/Goal');
const Investment = require('../models/Investment');
const FinancialTip = require('../models/FinancialTip');
const Feedback = require('../models/Feedback');
const AdminLog = require('../models/AdminLog');

// @desc    Get admin high-level metrics & stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalTransactions,
      activeDebts,
      totalGoals,
      feedbackPending,
      recentUsers,
      adminLogs,
    ] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Debt.countDocuments({ status: 'active' }),
      Goal.countDocuments(),
      Feedback.countDocuments({ status: 'pending' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      AdminLog.find().sort({ createdAt: -1 }).limit(10).populate('admin', 'name email'),
    ]);

    // Calculate system monetary volume
    const transactionAggregate = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    let totalSystemIncome = 0;
    let totalSystemExpense = 0;
    transactionAggregate.forEach((agg) => {
      if (agg._id === 'income') totalSystemIncome = agg.totalAmount;
      if (agg._id === 'expense') totalSystemExpense = agg.totalAmount;
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        activeDebts,
        totalGoals,
        feedbackPending,
        totalSystemVolume: Math.round((totalSystemIncome + totalSystemExpense) * 100) / 100,
        recentUsers,
        adminLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 15 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user ban/active status
// @route   PATCH /api/admin/users/:id/ban
// @access  Private/Admin
const toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot ban an administrative account.' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    await AdminLog.create({
      admin: req.user.id,
      action: user.isBanned ? 'BAN_USER' : 'UNBAN_USER',
      targetEntity: 'User',
      targetId: user._id,
      details: `${user.name} (${user.email}) was ${user.isBanned ? 'suspended' : 're-activated'}`,
    });

    res.json({
      success: true,
      message: `User ${user.name} has been ${user.isBanned ? 'suspended' : 're-activated'}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role (user/admin)
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    await AdminLog.create({
      admin: req.user.id,
      action: 'UPDATE_ROLE',
      targetEntity: 'User',
      targetId: user._id,
      details: `Role for ${user.email} modified to ${role}`,
    });

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Financial tips CRUD (CMS)
// @route   GET /api/admin/tips
// @access  Public (listing) / Admin (management)
const getTips = async (req, res, next) => {
  try {
    const tips = await FinancialTip.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tips });
  } catch (error) {
    next(error);
  }
};

const createTip = async (req, res, next) => {
  try {
    const { title, category, content, actionableAdvice, readingTimeMinutes, isFeatured } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide title and content' });
    }

    const tip = await FinancialTip.create({
      title,
      category: category || 'Budgeting',
      content,
      actionableAdvice: actionableAdvice || '',
      readingTimeMinutes: readingTimeMinutes || 2,
      isFeatured: Boolean(isFeatured),
      author: req.user.name || 'FinWise Advisory Team',
    });

    await AdminLog.create({
      admin: req.user.id,
      action: 'CREATE_TIP',
      targetEntity: 'FinancialTip',
      targetId: tip._id,
      details: `Created new financial advisory tip: "${title}"`,
    });

    res.status(201).json({ success: true, message: 'Financial tip published', data: tip });
  } catch (error) {
    next(error);
  }
};

const deleteTip = async (req, res, next) => {
  try {
    const tip = await FinancialTip.findById(req.params.id);
    if (!tip) return res.status(404).json({ success: false, message: 'Tip not found' });

    await tip.deleteOne();

    await AdminLog.create({
      admin: req.user.id,
      action: 'DELETE_TIP',
      targetEntity: 'FinancialTip',
      targetId: req.params.id,
      details: `Removed tip "${tip.title}"`,
    });

    res.json({ success: true, message: 'Tip removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserBan,
  updateUserRole,
  getTips,
  createTip,
  deleteTip,
};
