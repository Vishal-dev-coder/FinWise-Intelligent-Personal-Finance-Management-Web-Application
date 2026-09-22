const express = require('express');
const { updateProfile, getDashboardSummary } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);
router.get('/dashboard', getDashboardSummary);

module.exports = router;
