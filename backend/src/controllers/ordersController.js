const pool = require('../db/pool');

// Checkout: Validate cart and prepare order details
const checkout = async (req, res) => {
    const userId = req.session.user?.id;

    // Enforce login for checkout
    if (!userId) {
        return res.status(401).json({ error: 'You must be logged in to checkout' });
    }

    try {
        // Fetch the user's cart
        const cartQuery = `
            SELECT c.product_id, c.quantity, p.in_stock, p.name
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = $1
        `;
        const cartResult = await pool.query(cartQuery, [userId]);

        if (cartResult.rows.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Validate stock availability
        for (const item of cartResult.rows) {
            if (item.quantity > item.in_stock) {
                return res.status(400).json({
                    error: `Insufficient stock for product "${item.name}". Available: ${item.in_stock}`,
                });
            }
        }

        // If all products are in stock
        res.status(200).json({ message: 'All products are in stock' });
    } catch (err) {
        console.error('Error during checkout:', err);
        res.status(500).json({ error: 'Failed to checkout', details: err.message });
    }
};

// Place an order: Confirm the order after checkout
const placeOrder = async (req, res) => {
    const userId = req.session.user?.id;
    const { cartItems, totalPrice } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!cartItems || cartItems.length === 0 || !totalPrice) {
        return res.status(400).json({ error: 'Invalid order details' });
    }

    try {
        // Create a new order
        const orderQuery = `
            INSERT INTO orders (user_id, order_total_price, order_status)
            VALUES ($1, $2, 0) RETURNING order_id
        `;
        const orderResult = await pool.query(orderQuery, [userId, totalPrice]);
        const orderId = orderResult.rows[0].order_id;

        // Add products to the order and reduce stock
        const orderItemsQuery = `
            INSERT INTO products_of_order (order_id, product_id, price_when_buy, product_order_count)
            VALUES ($1, $2, $3, $4)
        `;
        const updateStockQuery = `
            UPDATE products SET in_stock = in_stock - $1 WHERE product_id = $2
        `;

        for (const item of cartItems) {
            await pool.query(orderItemsQuery, [orderId, item.product_id, item.price, item.quantity]);
            await pool.query(updateStockQuery, [item.quantity, item.product_id]);
        }

        // Clear the user's cart
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

const getOrderHistory = async (req, res) => {
    const userId = req.session.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const query = `
            SELECT 
                o.order_id,
                o.order_date,
                o.order_total_price,
                o.order_status,
                json_agg(
                    json_build_object(
                        'product_id', po.product_id,
                        'price_when_buy', po.price_when_buy,
                        'product_order_count', po.product_order_count,
                        'name', p.name,
                        'image', p.image
                    )
                ) AS products
            FROM orders o
            JOIN products_of_order po ON o.order_id = po.order_id
            JOIN products p ON po.product_id = p.product_id
            WHERE o.user_id = $1
            GROUP BY o.order_id
            ORDER BY o.order_date DESC;
        `;
        const result = await pool.query(query, [userId]);

        res.status(200).json({ orders: result.rows });
    } catch (err) {
        console.error('Error fetching order history:', err);
        res.status(500).json({ error: 'Failed to fetch order history', details: err.message });
    }
};

module.exports = {
    checkout, // New function
    placeOrder,
    cancelOrder,
    getOrderHistory,
};
