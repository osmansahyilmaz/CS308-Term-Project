const pool = require('../db/pool');

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

        // Check if the product has been delivered to the user
        const deliveryCheckQuery = `
            SELECT COUNT(*) AS delivered_count
            FROM orders o
            JOIN products_of_order po ON o.order_id = po.order_id
            WHERE o.user_id = $1 AND po.product_id = $2 AND o.order_status = 3; -- 3: delivered
        `;
        const deliveryCheckResult = await pool.query(deliveryCheckQuery, [userId, productId]);

        if (parseInt(deliveryCheckResult.rows[0].delivered_count, 10) === 0) {
            return res.status(403).json({ error: 'You can only review products that have been delivered to you' });
        }

        const query = `
            INSERT INTO reviews (product_id, user_id, rating, title, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING review_id, product_id, user_id, rating, title, comment, date;
        `;
        const values = [productId, userId, rating, title, comment];
        const result = await pool.query(query, values);

        res.status(201).json({ message: 'Review added successfully', review: result.rows[0] });
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).json({ error: 'Failed to add review', details: err.message });
    }
};

// Delete a review (only by the owner)
const deleteReview = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = req.session.user.id;
        const { id } = req.params;

        // Check if the review exists and belongs to the user
        const checkQuery = `
            SELECT * FROM reviews WHERE review_id = $1 AND user_id = $2;
        `;
        const checkResult = await pool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(403).json({ error: 'Forbidden: You can only delete your own reviews' });
        }

        // Delete the review
        const deleteQuery = `
            DELETE FROM reviews WHERE review_id = $1;
        `;
        await pool.query(deleteQuery, [id]);

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ error: 'Failed to delete review', details: err.message });
    }
};

module.exports = {
    addReview,
    deleteReview,
};
