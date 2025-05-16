const express = require('express');
const wishlistController = require('../controllers/wishlistController');

const router = express.Router();

router.post('/wishlist/add', wishlistController.addToWishlist);
router.delete('/wishlist/remove/:productId', wishlistController.removeFromWishlist);
router.get('/wishlist', wishlistController.getWishlist);

module.exports = router;
