const express = require('express');
const ordersController = require('../controllers/ordersController');

const router = express.Router();

// Place a new order
router.post('/orders', ordersController.placeOrder);

// Cancel an order
router.delete('/orders/:orderId/cancel', ordersController.cancelOrder);

// Update order status when checkout success page is viewed
router.put('/orders/:orderId/success', ordersController.updateOrderOnSuccess);

// Get all pending deliveries with details
router.get('/orders/pending-deliveries', ordersController.getPendingDeliveries);

// Fetch order history for a user
router.get('/orders/history', ordersController.getOrderHistory);

// ---- New route for SCRUM-136: update delivery status ----
router.patch('/orders/:orderId/status', ordersController.updateDeliveryStatus);

module.exports = router;
