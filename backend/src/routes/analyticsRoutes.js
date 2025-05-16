const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Route to calculate financial metrics (revenue, cost, profit/loss)
router.get('/analytics/financial', analyticsController.getFinancialMetrics);

module.exports = router; 