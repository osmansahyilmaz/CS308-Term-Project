const express = require('express');
const ordersController = require('../controllers/ordersController');

const router = express.Router();

// Place a new order
router.post('/orders', ordersController.placeOrder);

// Cancel an order
router.delete('/orders/:orderId/cancel', ordersController.cancelOrder);

module.exports = router;
