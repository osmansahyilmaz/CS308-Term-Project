const pool = require('../db/pool');
// const { getProductPriceDetails } = require('../utils/orderUtils'); // Assuming a utility function to get product price at time of order - Not used yet

// Submit a refund request
exports.submitRefundRequest = async (req, res) => {
    const { item_id, reason } = req.body;
    const customer_id = req.session.user ? req.session.user.id : null;

    if (!customer_id) {
        return res.status(401).json({ message: 'Unauthorized. Please log in to request a refund.' });
    }

    if (!item_id || !reason) {
        return res.status(400).json({ message: 'Missing item_id or reason for refund request.' });
    }

    try {
        // 1. Verify the item belongs to the customer and the order is delivered
        const orderItemQuery = `
            SELECT oi.*, o.order_delivered_date, o.order_date, o.user_id
            FROM products_of_order oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE oi.product_of_order_id = $1 AND o.user_id = $2;
        `;
        const orderItemResult = await pool.query(orderItemQuery, [item_id, customer_id]);

        if (orderItemResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order item not found or does not belong to the current user.' });
        }

        const orderItem = orderItemResult.rows[0];

        if (!orderItem.order_delivered_date) {
            return res.status(400).json({ message: 'Refund can only be requested for delivered items.' });
        }

        // 2. Check if refund is within 30 days of order date
        const orderDate = new Date(orderItem.order_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (orderDate < thirtyDaysAgo) {
            return res.status(400).json({ message: 'Refund period has expired (30 days from order date).' });
        }
        
        // 3. Check if a refund request already exists for this item
        const existingRefundQuery = 'SELECT refund_id FROM refund_requests WHERE item_id = $1;';
        const existingRefundResult = await pool.query(existingRefundQuery, [item_id]);
        if (existingRefundResult.rows.length > 0) {
            return res.status(409).json({ message: 'A refund request for this item already exists.' });
        }

        // 4. Calculate refund amount (price_when_buy - discount_when_buy)
        const refundAmount = parseFloat(orderItem.price_when_buy) - parseFloat(orderItem.discount_when_buy);
        if (isNaN(refundAmount) || refundAmount < 0) {
            console.error(`Error calculating refund amount for item_id: ${item_id}. Price: ${orderItem.price_when_buy}, Discount: ${orderItem.discount_when_buy}`);
            return res.status(500).json({ message: 'Error calculating refund amount.' });
        }

        // 5. Insert into refund_requests table
        const insertRefundQuery = `
            INSERT INTO refund_requests (item_id, customer_id, reason, refund_amount, status)
            VALUES ($1, $2, $3, $4, 'Pending')
            RETURNING *;
        `;
        const newRefundResult = await pool.query(insertRefundQuery, [item_id, customer_id, reason, refundAmount]);

        res.status(201).json({ message: 'Refund request submitted successfully.', refund_request: newRefundResult.rows[0] });

    } catch (error) {
        console.error('Error submitting refund request:', error);
        if (error.code === '23503' && error.constraint === 'refund_requests_item_id_fkey') {
             return res.status(404).json({ message: 'Invalid item_id. The specified order item (products_of_order_id) does not exist or is incorrect.' });
        }
        res.status(500).json({ message: 'Server error while submitting refund request.' });
    }
}; 