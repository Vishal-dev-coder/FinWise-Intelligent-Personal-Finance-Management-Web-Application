const express = require('express');
const { getFinancialReport, exportTransactionsCsv } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/analytics', getFinancialReport);
router.get('/export-csv', exportTransactionsCsv);

module.exports = router;
