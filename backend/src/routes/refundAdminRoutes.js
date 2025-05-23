const express = require('express');
const router = express.Router();
const refundAdminController = require('../controllers/refundAdminController');
const { isAuthenticated } = require('../utils/authMiddleware');

// GET /api/admin/refund-requests - Get all refund requests (data previously filtered by controller)
router.get('/admin/refund-requests', isAuthenticated, refundAdminController.getAllPendingRefunds);

// PATCH /api/admin/refund-requests/:id - Approve or reject a refund request
router.patch('/admin/refund-requests/:id', isAuthenticated, refundAdminController.updateRefundStatus);

module.exports = router; 