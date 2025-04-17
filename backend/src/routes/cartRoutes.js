const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/remove', cartController.removeFromCart);
router.post('/cart/remove-all', cartController.removeAllFromCart);
router.delete('/cart/clear', cartController.clearCart);
router.post('/cart/merge', cartController.mergeCart);

module.exports = router;
