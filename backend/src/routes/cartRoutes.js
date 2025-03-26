const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Get the current user's cart
router.get('/cart', cartController.getCart);

// Add a product to the cart
router.post('/cart/add', cartController.addToCart);

// Remove a product from the cart
router.post('/cart/remove', cartController.removeFromCart);

// Clear the cart
router.delete('/cart/clear', cartController.clearCart);

module.exports = router;