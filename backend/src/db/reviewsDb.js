const pool = require('./pool');

/**
 * Create a new review for a product
 */
const createReview = async (userId, productId, rating, title, comment) => {
    const query = `
        INSERT INTO reviews (user_id, product_id, rating, title, comment, status)
        VALUES ($1, $2, $3, $4, $5, 'PENDING')
        RETURNING review_id, user_id, product_id, rating, title, comment, date, status;
    `;
    const result = await pool.query(query, [userId, productId, rating, title, comment]);
    return result.rows[0];
};

/**
 * Get all reviews (with approval status filter option)
 */
const getAllReviews = async (approvedOnly = false) => {
    let query = `
        SELECT 
            r.*,
            u.username,
            p.name as product_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.product_id
    `;
    
    if (approvedOnly) {
        query += ` WHERE r.status = 'APPROVED'`;
    }
    
    query += ` ORDER BY r.date DESC`;
    
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Get all reviews for a specific product
 */
const getReviewsByProductId = async (productId, approvedOnly = true) => {
    let query = `
        SELECT 
            r.*,
            u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = $1
    `;
    
    if (approvedOnly) {
        query += ` AND r.status = 'APPROVED'`;
    }
    
    query += ` ORDER BY r.date DESC`;
    
    const result = await pool.query(query, [productId]);
    return result.rows;
};

/**
 * Get all reviews for a specific product to calculate rating
 */
const getAllReviewsForRating = async (productId) => {
    const query = `
        SELECT 
            r.rating
        FROM reviews r
        WHERE r.product_id = $1
    `;
    
    const result = await pool.query(query, [productId]);
    return result.rows;
};

/**
 * Get pending reviews (not yet approved)
 */
const getPendingReviews = async () => {
    const query = `
        SELECT 
            r.*,
            u.username,
            p.name as product_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.product_id
        WHERE r.status = 'PENDING'
        ORDER BY r.date ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Get a specific review by ID
 */
const getReviewById = async (reviewId) => {
    const query = `
        SELECT 
            r.*,
            u.username,
            p.name as product_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.product_id
        WHERE r.review_id = $1
    `;
    
    const result = await pool.query(query, [reviewId]);
    return result.rows[0];
};

/**
 * Update a review
 */
const updateReview = async (reviewId, rating, title, comment) => {
    const query = `
        UPDATE reviews
        SET 
            rating = $1,
            title = $2,
            comment = $3,
            status = 'PENDING'
        WHERE review_id = $4
        RETURNING review_id, user_id, product_id, rating, title, comment, date, status;
    `;
    
    const result = await pool.query(query, [rating, title, comment, reviewId]);
    return result.rows[0];
};

/**
 * Delete a review
 */
const deleteReview = async (reviewId) => {
    const query = `DELETE FROM reviews WHERE review_id = $1 RETURNING *`;
    const result = await pool.query(query, [reviewId]);
    return result.rows[0];
};

/**
 * Approve a review
 */
const approveReview = async (reviewId) => {
    const query = `
        UPDATE reviews
        SET status = 'APPROVED'
        WHERE review_id = $1
        RETURNING review_id, user_id, product_id, rating, title, comment, date, status;
    `;
    
    const result = await pool.query(query, [reviewId]);
    return result.rows[0];
};

/**
 * Reject a review
 */
const rejectReview = async (reviewId) => {
    const query = `
        UPDATE reviews
        SET status = 'REJECTED'
        WHERE review_id = $1
        RETURNING review_id, user_id, product_id, rating, title, comment, date, status;
    `;
    
    const result = await pool.query(query, [reviewId]);
    return result.rows[0];
};

/**
 * Check if a user has already reviewed a product
 */
const checkUserReviewedProduct = async (userId, productId) => {
    const query = `
        SELECT COUNT(*) as review_count
        FROM reviews
        WHERE user_id = $1 AND product_id = $2
    `;
    
    const result = await pool.query(query, [userId, productId]);
    return parseInt(result.rows[0].review_count) > 0;
};

/**
 * Check if user has purchased and received the product
 */
const checkUserCanReviewProduct = async (userId, productId) => {
    const query = `
        SELECT COUNT(*) as delivered_count
        FROM orders o
        JOIN products_of_order po ON o.order_id = po.order_id
        WHERE o.user_id = $1 AND po.product_id = $2 AND o.order_status = 3
    `;
    
    const result = await pool.query(query, [userId, productId]);
    return parseInt(result.rows[0].delivered_count) > 0;
};

/**
 * Calculate average rating for a product
 */
const calculateProductRating = async (productId) => {
    const query = `
        SELECT AVG(rating) as average_rating
        FROM reviews
        WHERE product_id = $1
    `;
    
    const result = await pool.query(query, [productId]);
    return parseFloat(result.rows[0].average_rating) || 0;
};

module.exports = {
    createReview,
    getAllReviews,
    getReviewsByProductId,
    getAllReviewsForRating,
    getPendingReviews,
    getReviewById,
    updateReview,
    deleteReview,
    approveReview,
    rejectReview,
    checkUserReviewedProduct,
    checkUserCanReviewProduct,
    calculateProductRating
};