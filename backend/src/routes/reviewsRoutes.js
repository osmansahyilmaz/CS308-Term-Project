const express = require('express');
const reviewsController = require('../controllers/reviewsController');

const router = express.Router();

// Add a new review
router.post('/reviews', reviewsController.addReview);

// Delete a review (only by the owner)
router.delete('/reviews/:id', reviewsController.deleteReview);

// Check if a user can add a review
router.get('/reviews/can-add/:productId', reviewsController.canAddReview);

module.exports = router;
