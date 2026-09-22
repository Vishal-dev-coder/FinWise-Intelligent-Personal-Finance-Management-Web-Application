const express = require('express');
const {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  updateFeedbackStatus,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', submitFeedback);
router.get('/my', getMyFeedback);

// Admin moderation of feedback
router.get('/all', adminOnly, getAllFeedback);
router.patch('/:id/status', adminOnly, updateFeedbackStatus);

module.exports = router;
