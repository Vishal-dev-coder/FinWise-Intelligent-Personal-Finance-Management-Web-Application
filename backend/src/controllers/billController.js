const Bill = require('../models/Bill');

// @desc    Get all bills & subscriptions with summary & leakage detector
// @route   GET /api/bills
// @access  Private
const getBills = async (req, res, next) => {
  try {
    const bills = await Bill.find({ user: req.user.id }).sort({ dueDate: 1 });

    const subscriptions = bills.filter((b) => b.isSubscription);
    const standardBills = bills.filter((b) => !b.isSubscription);

    const monthlySubscriptionTotal = subscriptions.reduce((sum, s) => {
      if (s.frequency === 'yearly') return sum + s.amount / 12;
      if (s.frequency === 'weekly') return sum + s.amount * 4.33;
      return sum + s.amount;
    }, 0);

    const unpaidCount = bills.filter((b) => !b.isPaid).length;
    const totalDueThisMonth = bills
      .filter((b) => !b.isPaid)
      .reduce((sum, b) => sum + b.amount, 0);

    // Subscription Leakage Analysis (e.g. streaming overlaps or high recurring totals)
    const leakageWarnings = [];
    const streamingSubs = subscriptions.filter((s) => s.category === 'Streaming');
    if (streamingSubs.length >= 3) {
      leakageWarnings.push({
        type: 'subscription_overlap',
        title: 'Streaming Redundancy',
        message: `You have ${streamingSubs.length} active video/music streaming services. Rotating them could save up to $${(streamingSubs.slice(1).reduce((s, b) => s + b.amount, 0) * 12).toFixed(0)} annually.`,
      });
    }

    if (monthlySubscriptionTotal > 200) {
      leakageWarnings.push({
        type: 'high_recurring_burden',
        title: 'High Subscription Ratio',
        message: `Your monthly fixed recurring subscriptions ($${monthlySubscriptionTotal.toFixed(2)}) exceed the healthy $200 benchmark.`,
      });
    }

    res.json({
      success: true,
      data: bills,
      summary: {
        totalBillsCount: bills.length,
        subscriptionsCount: subscriptions.length,
        monthlySubscriptionTotal: Math.round(monthlySubscriptionTotal * 100) / 100,
        unpaidCount,
        totalDueThisMonth: Math.round(totalDueThisMonth * 100) / 100,
      },
      leakageWarnings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create bill or subscription
// @route   POST /api/bills
// @access  Private
const createBill = async (req, res, next) => {
  try {
    const {
      title,
      amount,
      category,
      frequency,
      dueDate,
      isSubscription,
      autoPay,
      paymentMethod,
    } = req.body;

    if (!title || !amount || !dueDate) {
      return res.status(400).json({ success: false, message: 'Please provide title, amount, and due date' });
    }

    const bill = await Bill.create({
      user: req.user.id,
      title,
      amount: Number(amount),
      category: category || 'Utilities',
      frequency: frequency || 'monthly',
      dueDate: new Date(dueDate),
      isSubscription: Boolean(isSubscription),
      autoPay: Boolean(autoPay),
      paymentMethod: paymentMethod || 'card',
    });

    res.status(201).json({
      success: true,
      message: `${isSubscription ? 'Subscription' : 'Bill'} saved successfully`,
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bill paid / unpaid status
// @route   PATCH /api/bills/:id/toggle-paid
// @access  Private
const toggleBillPaid = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user.id });
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    bill.isPaid = !bill.isPaid;
    if (bill.isPaid) {
      bill.lastPaymentDate = new Date();
      // If recurring, bump dueDate by frequency
      if (bill.frequency === 'monthly') {
        const nextDue = new Date(bill.dueDate);
        nextDue.setMonth(nextDue.getMonth() + 1);
        bill.dueDate = nextDue;
        bill.isPaid = false; // reset for next cycle
      }
    }

    await bill.save();

    res.json({
      success: true,
      message: bill.isPaid ? 'Bill marked as paid!' : 'Bill marked as pending / next cycle scheduled.',
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bill
// @route   PUT /api/bills/:id
// @access  Private
const updateBill = async (req, res, next) => {
  try {
    let bill = await Bill.findOne({ _id: req.params.id, user: req.user.id });
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    bill = await Bill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Bill updated',
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Private
const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user.id });
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    await bill.deleteOne();

    res.json({
      success: true,
      message: 'Bill removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBills,
  createBill,
  toggleBillPaid,
  updateBill,
  deleteBill,
};
