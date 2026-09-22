const express = require('express');
const {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInvestments)
  .post(createInvestment);

router.route('/:id')
  .put(updateInvestment)
  .delete(deleteInvestment);

module.exports = router;
