const express = require('express');
const { getSmartDashboard } = require('../controllers/smartInsightsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getSmartDashboard);

module.exports = router;
