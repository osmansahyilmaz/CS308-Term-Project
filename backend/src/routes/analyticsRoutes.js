const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Route to calculate financial metrics (revenue, cost, profit/loss)
router.get('/analytics/financial', analyticsController.getFinancialMetrics);

// Route to generate chart data for revenue/profit visualization
router.get('/analytics/chart-data', analyticsController.getChartData);

module.exports = router; 