const express = require('express');
const {
  getDebts,
  createDebt,
  makeDebtPayment,
  updateDebt,
  deleteDebt,
} = require('../controllers/debtController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDebts)
  .post(createDebt);

router.post('/:id/pay', makeDebtPayment);

router.route('/:id')
  .put(updateDebt)
  .delete(deleteDebt);

module.exports = router;
