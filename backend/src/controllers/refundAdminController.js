const pool = require('../db/pool');

// Get all pending refund requests
exports.getAllPendingRefunds = async (req, res) => {
    try {
        const query = `
            SELECT 
                rr.refund_id,
                rr.reason,
                rr.status,
                rr.refund_amount,
                rr.created_at AS request_date,
                oi.product_of_order_id AS item_id,
                p.name AS product_name,
                p.product_id,
                oi.price_when_buy,
                oi.discount_when_buy,
                oi.product_order_count AS quantity_ordered,
                o.order_id,
                o.order_date,
                u.id AS customer_id,
                u.username AS customer_username,
                u.email AS customer_email
            FROM refund_requests rr
            JOIN products_of_order oi ON rr.item_id = oi.product_of_order_id
            JOIN products p ON oi.product_id = p.product_id
            JOIN orders o ON oi.order_id = o.order_id
            JOIN users u ON rr.customer_id = u.id
            WHERE rr.status = 'Pending'
            ORDER BY rr.created_at ASC;
        `;
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching pending refund requests:', error);
        res.status(500).json({ message: 'Server error while fetching pending refund requests.' });
    }
};

// Approve or reject a refund request
exports.updateRefundStatus = async (req, res) => {
    const { id } = req.params; // refund_id
    const { status } = req.body; // 'Approved' or 'Rejected'
    const salesManagerId = req.session.user ? req.session.user.id : null;

    if (!salesManagerId) {
        // This should ideally be caught by middleware, but as a safeguard:
        return res.status(401).json({ message: 'Unauthorized. Sales manager not identified.' });
    }

    if (!status || !['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided. Must be \'Approved\' or \'Rejected\'.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Fetch the refund request and related product_id for stock update
        const refundQuery = `
            SELECT rr.*, oi.product_id, oi.product_order_count 
            FROM refund_requests rr
            JOIN products_of_order oi ON rr.item_id = oi.product_of_order_id
            WHERE rr.refund_id = $1;
        `;
        const refundResult = await client.query(refundQuery, [id]);

        if (refundResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Refund request not found.' });
        }

        const refundRequest = refundResult.rows[0];

        if (refundRequest.status !== 'Pending') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: `Refund request has already been ${refundRequest.status.toLowerCase()}.` });
        }

        // 2. Update refund_requests table
        const updateQuery = `
            UPDATE refund_requests 
            SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP 
            WHERE refund_id = $3
            RETURNING *;
        `;
        const updatedRefundResult = await client.query(updateQuery, [status, salesManagerId, id]);

        // 3. If approved, add product back to stock
        if (status === 'Approved') {
            const productToUpdate = refundRequest.product_id;
            const quantityToReturn = refundRequest.product_order_count; // Assuming refund is for the whole quantity of that item line
            
            const updateStockQuery = `
                UPDATE products 
                SET in_stock = in_stock + $1 
                WHERE product_id = $2;
            `;
            await client.query(updateStockQuery, [quantityToReturn, productToUpdate]);
            // Here you would typically trigger a refund notification (e.g., email to customer)
            // For now, we'll just send a success message.
        }

        await client.query('COMMIT');
        res.status(200).json({
            message: `Refund request ${status.toLowerCase()} successfully.`,
            refund_request: updatedRefundResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating refund status:', error);
        res.status(500).json({ message: 'Server error while updating refund status.' });
    } finally {
        client.release();
    }
}; 