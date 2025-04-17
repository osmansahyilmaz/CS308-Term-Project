const express = require('express');
const reviewsController = require('../controllers/reviewsController');

const router = express.Router();

// Add a new review
router.post('/reviews', reviewsController.addReview);

// Delete a review (only by the owner)
router.delete('/reviews/:id', reviewsController.deleteReview);

module.exports = router;
