const express = require('express');
const {
  getBills,
  createBill,
  toggleBillPaid,
  updateBill,
  deleteBill,
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBills)
  .post(createBill);

router.patch('/:id/toggle-paid', toggleBillPaid);

router.route('/:id')
  .put(updateBill)
  .delete(deleteBill);

module.exports = router;
