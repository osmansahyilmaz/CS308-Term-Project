const pool = require('../db/pool');

const placeOrder = async (req, res) => {
    const userId = req.session.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        // Step 1: Fetch the user's cart
        const cartQuery = `
            SELECT c.product_id, c.quantity, p.in_stock, p.price
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = $1
        `;
        const cartResult = await pool.query(cartQuery, [userId]);

        if (cartResult.rows.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Step 2: Check stock availability
        for (const item of cartResult.rows) {
            if (item.quantity > item.in_stock) {
                return res.status(400).json({
                    error: `Insufficient stock for product ID ${item.product_id}. Available: ${item.in_stock}`,
                });
            }
        }

        // Step 3: Create a new order
        const orderQuery = `
            INSERT INTO orders (user_id, order_total_price, order_status)
            VALUES ($1, $2, 0) RETURNING order_id
        `;
        const totalPrice = cartResult.rows.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const orderResult = await pool.query(orderQuery, [userId, totalPrice]);
        const orderId = orderResult.rows[0].order_id;

        // Step 4: Add products to the order and reduce stock
        const orderItemsQuery = `
            INSERT INTO products_of_order (order_id, product_id, price_when_buy, product_order_count)
            VALUES ($1, $2, $3, $4)
        `;
        const updateStockQuery = `
            UPDATE products SET in_stock = in_stock - $1 WHERE product_id = $2
        `;

        for (const item of cartResult.rows) {
            await pool.query(orderItemsQuery, [orderId, item.product_id, item.price, item.quantity]);
            await pool.query(updateStockQuery, [item.quantity, item.product_id]);
        }

        // Step 5: Clear the user's cart
        const clearCartQuery = `DELETE FROM cart WHERE user_id = $1`;
        await pool.query(clearCartQuery, [userId]);

        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({ error: 'Failed to place order', details: err.message });
    }
};

const cancelOrder = async (req, res) => {
    const userId = req.session.user?.id;
    const { orderId } = req.params;

    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        // Step 1: Check the order status
        const orderStatusQuery = `
            SELECT order_status FROM orders WHERE order_id = $1 AND user_id = $2
        `;
        const orderStatusResult = await pool.query(orderStatusQuery, [orderId, userId]);

        if (orderStatusResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const orderStatus = orderStatusResult.rows[0].order_status;

        // Step 2: Allow cancellation only for 'verifying' (0) or 'processing' (1) statuses
        if (orderStatus > 1) {
            return res.status(400).json({ error: 'Order cannot be canceled at this stage' });
        }

        // Step 3: Update the order status to "canceled" (4)
        const cancelOrderQuery = `
            UPDATE orders
            SET order_status = 4
            WHERE order_id = $1 AND user_id = $2
        `;
        await pool.query(cancelOrderQuery, [orderId, userId]);

        // Step 4: Restore stock for canceled order items
        const restoreStockQuery = `
            UPDATE products
            SET in_stock = in_stock + po.product_order_count
            FROM products_of_order po
            WHERE po.product_id = products.product_id AND po.order_id = $1
        `;
        await pool.query(restoreStockQuery, [orderId]);

        res.status(200).json({ message: 'Order canceled successfully' });
    } catch (err) {
        console.error('Error canceling order:', err);
        res.status(500).json({ error: 'Failed to cancel order', details: err.message });
    }
};

module.exports = {
    placeOrder,
    cancelOrder,
};
