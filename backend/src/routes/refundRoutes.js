const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');
const { isAuthenticated } = require('../utils/authMiddleware'); // Assuming an auth middleware

// POST /api/refund-request - Submit a new refund request
router.post('/refund-request', isAuthenticated, refundController.submitRefundRequest);

module.exports = router; 