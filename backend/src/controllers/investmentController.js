const Investment = require('../models/Investment');

// @desc    Get all investments with portfolio P&L & allocation breakdown
// @route   GET /api/investments
// @access  Private
const getInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user.id }).sort({ currentValue: -1 });

    let totalInvested = 0;
    let totalCurrentValue = 0;
    const typeDistribution = {};

    const enriched = investments.map((inv) => {
      totalInvested += inv.investedAmount;
      totalCurrentValue += inv.currentValue;

      const pnl = inv.currentValue - inv.investedAmount;
      const roi = inv.investedAmount > 0 ? ((pnl / inv.investedAmount) * 100) : 0;

      // Group by asset type
      typeDistribution[inv.type] = (typeDistribution[inv.type] || 0) + inv.currentValue;

      return {
        ...inv.toObject(),
        pnl: Math.round(pnl * 100) / 100,
        roi: Math.round(roi * 100) / 100,
      };
    });

    const totalPnL = totalCurrentValue - totalInvested;
    const totalROI = totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0;

    const allocation = Object.entries(typeDistribution).map(([type, value]) => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: Math.round(value * 100) / 100,
      percent: totalCurrentValue > 0 ? Math.round((value / totalCurrentValue) * 100) : 0,
    }));

    res.json({
      success: true,
      data: enriched,
      summary: {
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
        totalPnL: Math.round(totalPnL * 100) / 100,
        totalROI: Math.round(totalROI * 100) / 100,
        allocation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create investment
// @route   POST /api/investments
// @access  Private
const createInvestment = async (req, res, next) => {
  try {
    const { name, symbol, type, investedAmount, currentValue, units, buyPricePerUnit, purchaseDate, notes } = req.body;

    if (!name || investedAmount === undefined || currentValue === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide name, invested amount, and current value' });
    }

    const investment = await Investment.create({
      user: req.user.id,
      name,
      symbol: symbol || '',
      type: type || 'stocks',
      investedAmount: Number(investedAmount),
      currentValue: Number(currentValue),
      units: Number(units) || 1,
      buyPricePerUnit: Number(buyPricePerUnit) || 0,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Investment added to portfolio',
      data: investment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update investment
// @route   PUT /api/investments/:id
// @access  Private
const updateInvestment = async (req, res, next) => {
  try {
    let investment = await Investment.findOne({ _id: req.params.id, user: req.user.id });
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    investment = await Investment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Investment details updated',
      data: investment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete investment
// @route   DELETE /api/investments/:id
// @access  Private
const deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, user: req.user.id });
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    await investment.deleteOne();

    res.json({
      success: true,
      message: 'Investment removed from portfolio',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
};
