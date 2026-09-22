const Feedback = require('../models/Feedback');

// @desc    Submit feedback or report an issue
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res, next) => {
  try {
    const { subject, category, message, rating } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide subject and message' });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      subject,
      category: category || 'General Feedback',
      message,
      rating: Number(rating) || 5,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been sent to our development and support team.',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own feedback tickets
// @route   GET /api/feedback/my
// @access  Private
const getMyFeedback = async (req, res, next) => {
  try {
    const tickets = await Feedback.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all feedback tickets
// @route   GET /api/feedback/all
// @access  Private/Admin
const getAllFeedback = async (req, res, next) => {
  try {
    const tickets = await Feedback.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update feedback status and response
// @route   PATCH /api/feedback/:id/status
// @access  Private/Admin
const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status, adminResponse } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) feedback.status = status;
    if (adminResponse) feedback.adminResponse = adminResponse;

    await feedback.save();

    res.json({
      success: true,
      message: 'Ticket status updated',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  updateFeedbackStatus,
};
