const pool = require('../db/pool');
const reviewsDb = require('../db/reviewsDb');

// Add a new review
const addReview = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = req.session.user.id;
        const { productId, rating, title, comment } = req.body;

        if (!productId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Invalid product ID or rating' });
        }
        
        // Check if user has purchased and received the product
        const canReview = await reviewsDb.checkUserCanReviewProduct(userId, productId);
        if (!canReview) {
            return res.status(403).json({ 
                error: 'You can only review products you have purchased and received' 
            });
        }
        
        // Check if user has already reviewed this product
        const hasReviewed = await reviewsDb.checkUserReviewedProduct(userId, productId);
        if (hasReviewed) {
            return res.status(400).json({ 
                error: 'You have already reviewed this product' 
            });
        }

        const review = await reviewsDb.createReview(userId, productId, rating, title, comment);

        res.status(201).json({ 
            message: 'Review added successfully. It will be visible after approval.', 
            review 
        });
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).json({ error: 'Failed to add review', details: err.message });
    }
};

// Get all reviews for a product (only approved ones for regular users)
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const isProductManager = req.session.user && req.session.user.role_id === 2;
        
        // If user is a product manager, they can see all reviews
        // Otherwise, they can only see approved reviews
        const reviews = await reviewsDb.getReviewsByProductId(productId, !isProductManager);
        
        res.status(200).json({ reviews });
    } catch (err) {
        console.error('Error getting product reviews:', err);
        res.status(500).json({ error: 'Failed to get reviews', details: err.message });
    }
};

// Get all pending reviews (Product Manager only)
const getPendingReviews = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Product Managers can see pending reviews
        if (req.session.user.role_id !== 2) {
            return res.status(403).json({ error: 'Forbidden: Only Product Managers can view pending reviews' });
        }
        
        const pendingReviews = await reviewsDb.getPendingReviews();
        
        res.status(200).json({ pendingReviews });
    } catch (err) {
        console.error('Error getting pending reviews:', err);
        res.status(500).json({ error: 'Failed to get pending reviews', details: err.message });
    }
};

// Approve a review (Product Manager only)
const approveReview = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Product Managers can approve reviews
        if (req.session.user.role_id !== 2) {
            return res.status(403).json({ error: 'Forbidden: Only Product Managers can approve reviews' });
        }
        
        const { reviewId } = req.params;
        
        // Check if review exists
        const review = await reviewsDb.getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        const updatedReview = await reviewsDb.approveReview(reviewId);
        
        res.status(200).json({ 
            message: 'Review approved successfully', 
            review: updatedReview 
        });
    } catch (err) {
        console.error('Error approving review:', err);
        res.status(500).json({ error: 'Failed to approve review', details: err.message });
    }
};

// Disapprove a review (Product Manager only)
const disapproveReview = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Product Managers can disapprove reviews
        if (req.session.user.role_id !== 2) {
            return res.status(403).json({ error: 'Forbidden: Only Product Managers can disapprove reviews' });
        }
        
        const { reviewId } = req.params;
        
        // Check if review exists
        const review = await reviewsDb.getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        const updatedReview = await reviewsDb.disapproveReview(reviewId);
        
        res.status(200).json({ 
            message: 'Review disapproved successfully', 
            review: updatedReview 
        });
    } catch (err) {
        console.error('Error disapproving review:', err);
        res.status(500).json({ error: 'Failed to disapprove review', details: err.message });
    }
};

// Check if a user can add a review for a product
const canAddReview = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = req.session.user.id;
        const { productId } = req.params;

        // Check if the product has been delivered to the user
        const canReview = await reviewsDb.checkUserCanReviewProduct(userId, productId);
        
        // Check if user already reviewed this product
        const hasReviewed = await reviewsDb.checkUserReviewedProduct(userId, productId);
        
        res.status(200).json({ 
            canAddReview: canReview && !hasReviewed,
            hasReceived: canReview,
            hasReviewed: hasReviewed
        });
    } catch (err) {
        console.error('Error checking if user can add review:', err);
        res.status(500).json({ error: 'Failed to check review eligibility', details: err.message });
    }
};

// Update a review (only by the owner)
const updateReview = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = req.session.user.id;
        const { reviewId } = req.params;
        const { rating, title, comment } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Invalid rating' });
        }
        
        // Check if the review exists and belongs to the user
        const review = await reviewsDb.getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        if (review.user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own reviews' });
        }
        
        const updatedReview = await reviewsDb.updateReview(reviewId, rating, title, comment);
        
        res.status(200).json({ 
            message: 'Review updated successfully. It will be visible after approval.', 
            review: updatedReview 
        });
    } catch (err) {
        console.error('Error updating review:', err);
        res.status(500).json({ error: 'Failed to update review', details: err.message });
    }
};

// Delete a review (only by the owner)
const deleteReview = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = req.session.user.id;
        const { reviewId } = req.params;

        // Check if the review exists
        const review = await reviewsDb.getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        // Check if user is the owner or a Product Manager
        if (review.user_id !== userId && req.session.user.role_id !== 2) {
            return res.status(403).json({ 
                error: 'Forbidden: You can only delete your own reviews or must be a Product Manager' 
            });
        }

        // Delete the review
        await reviewsDb.deleteReview(reviewId);

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ error: 'Failed to delete review', details: err.message });
    }
};

module.exports = {
    addReview,
    getProductReviews,
    getPendingReviews,
    approveReview,
    disapproveReview,
    deleteReview,
    updateReview,
    canAddReview
};
