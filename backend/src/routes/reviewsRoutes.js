const express = require('express');
const reviewsController = require('../controllers/reviewsController');

const router = express.Router();

// Public endpoints
// Get all reviews for a product
router.get('/reviews/product/:productId', reviewsController.getProductReviews);

// Get product rating
router.get('/reviews/rating/:productId', reviewsController.getProductRating);

// Protected endpoints - require authentication
// Add a new review
router.post('/reviews', reviewsController.addReview);

// Update a review
router.put('/reviews/:reviewId', reviewsController.updateReview);

// Delete a review
router.delete('/reviews/:reviewId', reviewsController.deleteReview);

// Check if a user can add a review
router.get('/reviews/can-add/:productId', reviewsController.canAddReview);

// Product Manager only endpoints
// Get all pending reviews
router.get('/reviews/pending', reviewsController.getPendingReviews);

// Approve a review
router.put('/reviews/:reviewId/approve', reviewsController.approveReview);

// Reject a review
router.put('/reviews/:reviewId/reject', reviewsController.rejectReview);

module.exports = router;