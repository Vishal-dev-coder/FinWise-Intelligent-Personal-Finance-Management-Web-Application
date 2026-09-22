const express = require('express');
const {
  getAdminStats,
  getAllUsers,
  toggleUserBan,
  updateUserRole,
  getTips,
  createTip,
  deleteTip,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

// Publicly readable tips (used on user dashboard/tips tab)
router.get('/tips/public', getTips);

// Protected Admin-only routes
router.use(protect);
router.use(adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/ban', toggleUserBan);
router.patch('/users/:id/role', updateUserRole);

router.route('/tips')
  .get(getTips)
  .post(createTip);

router.delete('/tips/:id', deleteTip);

module.exports = router;
