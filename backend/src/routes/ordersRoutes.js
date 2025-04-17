const express = require('express');
const ordersController = require('../controllers/ordersController');

const router = express.Router();

// Place a new order
router.post('/orders', ordersController.placeOrder);

// Cancel an order
router.delete('/orders/:orderId/cancel', ordersController.cancelOrder);

// Fetch order history for a user
router.get('/orders/history', ordersController.getOrderHistory);

module.exports = router;
