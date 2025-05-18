const pool = require('../db/pool');
const { generateInvoicePdf } = require('./invoiceController');

const placeOrder = async (req, res) => {
    const userId = req.session.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // Accept order_shipping_address as a string (address title)
    const { order_shipping_address } = req.body;

    try {
        // Step 1: Fetch the user's cart
        const cartQuery = `
            SELECT c.product_id, c.quantity, p.in_stock, p.price, p.discount
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

        // Step 3: Create a new order (store order_shipping_address as title)
        const orderQuery = `
            INSERT INTO orders (user_id, order_total_price, order_status, order_shipping_address)
            VALUES ($1, $2, 1, $3) RETURNING order_id
        `;
        const totalPrice = cartResult.rows.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const orderResult = await pool.query(orderQuery, [userId, totalPrice, order_shipping_address]);
        const orderId = orderResult.rows[0].order_id;

        // Step 4: Add products to the order and reduce stock
        const orderItemsQuery = `
            INSERT INTO products_of_order (order_id, product_id, price_when_buy, discount_when_buy, product_order_count)
            VALUES ($1, $2, CAST($3 AS numeric), $4, $5)
        `;
        const updateStockQuery = `
            UPDATE products SET in_stock = in_stock - $1 WHERE product_id = $2
        `;

        for (const item of cartResult.rows) {
            await pool.query(orderItemsQuery, [orderId, item.product_id, item.price, item.discount || 0, item.quantity]);
            await pool.query(updateStockQuery, [item.quantity, item.product_id]);
        }

        // Step 5: Clear the user's cart
        const clearCartQuery = `DELETE FROM cart WHERE user_id = $1`;
        await pool.query(clearCartQuery, [userId]);

        // Step 6: Create invoice with a consistent invoice number
        const timestamp = Date.now();
        const invoiceNumber = `INV-${timestamp}`;
        
        const invoiceResult = await pool.query(`
            INSERT INTO invoices (user_id, order_id, generated_date, invoice_description)
            VALUES ($1, $2, to_timestamp($3/1000.0), $4) RETURNING invoice_id
        `, [userId, orderId, timestamp, invoiceNumber]);
        
        const invoiceId = invoiceResult.rows[0].invoice_id;
        
        // Step 7: Automatically generate and save invoice PDF
        try {
            console.log(`⏳ Generating invoice PDF for order ${orderId}...`);
            const pdfResult = await generateInvoicePdf(invoiceId, orderId, userId);
            
            if (pdfResult && pdfResult.success) {
                console.log(`✅ Invoice PDF automatically generated for order ${orderId}`);
                
                // Return all necessary information
                return res.status(201).json({ 
                    message: 'Order placed successfully', 
                    orderId,
                    invoiceId,
                    invoiceNumber,
                    invoicePdfUrl: pdfResult.url
                });
            } else {
                console.error(`❌ Failed to generate PDF for order ${orderId}:`, pdfResult?.error || 'Unknown error');
                // Even if PDF generation fails, return order info
                return res.status(201).json({ 
                    message: 'Order placed successfully, but PDF generation failed', 
                    orderId,
                    invoiceId,
                    invoiceNumber
                });
            }
        } catch (invoiceErr) {
            console.error(`Error generating invoice PDF for order ${orderId}:`, invoiceErr);
            // Even if PDF generation fails, return order info
            return res.status(201).json({ 
                message: 'Order placed successfully, but PDF generation failed', 
                orderId,
                invoiceId,
                invoiceNumber
            });
        }

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

// Update order status to processing when checkout success page is viewed
const updateOrderOnSuccess = async (req, res) => {
    const userId = req.session.user?.id;
    const { orderId } = req.params;

    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        // Update the order status to "processing" (1)
        const updateQuery = `
            UPDATE orders
            SET order_status = 1
            WHERE order_id = $1 AND user_id = $2
            RETURNING order_id, order_status
        `;
        const result = await pool.query(updateQuery, [orderId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.status(200).json({ 
            message: 'Order status updated to processing',
            orderId: result.rows[0].order_id,
            status: result.rows[0].order_status
        });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Failed to update order status', details: err.message });
    }
};

// Get all pending deliveries with details
const getPendingDeliveries = async (req, res) => {
    try {
        // Check authentication and authorization
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Sales Managers (role_id = 3) can view all pending deliveries
        if (req.session.user.role_id !== 3) {
            return res.status(403).json({ error: 'Forbidden: Only Sales Managers can view all pending deliveries' });
        }
        
        // Get all orders that are not canceled or delivered
        // Status: 1 = processing, 2 = in-transit
        const query = `
            SELECT 
                o.order_id AS delivery_id,
                o.user_id AS customer_id,
                u.username AS customer_name,
                o.order_date,
                o.order_total_price AS total_price,
                o.order_status,
                CASE 
                    WHEN o.order_status = 1 THEN 'Processing'
                    WHEN o.order_status = 2 THEN 'In-Transit'
                    ELSE 'Unknown'
                END AS status_text,
                a.address_line1,
                a.address_line2,
                a.city,
                a.state,
                a.postal_code,
                a.country,
                a.phone,
                json_agg(
                    json_build_object(
                        'product_id', po.product_id,
                        'product_name', p.name,
                        'quantity', po.product_order_count,
                        'price', po.price_when_buy,
                        'discount', po.discount_when_buy
                    )
                ) AS products
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN address a ON u.id = a.user_id AND a.is_default = true
            JOIN products_of_order po ON o.order_id = po.order_id
            JOIN products p ON po.product_id = p.product_id
            WHERE o.order_status IN (1, 2) -- Processing or In-Transit
            GROUP BY o.order_id, o.user_id, u.username, o.order_date, o.order_total_price, o.order_status, 
                     a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.country, a.phone
            ORDER BY o.order_date ASC;
        `;
        
        const result = await pool.query(query);
        
        res.status(200).json({ 
            count: result.rows.length,
            pendingDeliveries: result.rows 
        });
    } catch (err) {
        console.error('Error fetching pending deliveries:', err);
        res.status(500).json({ error: 'Failed to fetch pending deliveries', details: err.message });
    }
};

// ---- New handler for SCRUM-136: update delivery status ----
const updateDeliveryStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const statusMap = {
        processing:    { code: 1, dateField: 'order_processing_date' },
        'in-transit':  { code: 2, dateField: 'order_in_transit_date' },
        delivered:     { code: 3, dateField: 'order_delivered_date' },
    };
    const mapping = statusMap[status];
    if (!mapping) {
        return res.status(400).json({ error: 'Invalid status. Must be one of processing, in-transit, delivered' });
    }

    try {
        const query = `
            UPDATE orders
               SET order_status = $1,
                   ${mapping.dateField} = CURRENT_TIMESTAMP
             WHERE order_id = $2
        RETURNING 
            order_id, 
            order_status, 
            order_processing_date, 
            order_in_transit_date, 
            order_delivered_date;
        `;
        const { rows } = await pool.query(query, [mapping.code, orderId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        return res.json({
            message: `Order status updated to '${status}'`,
            order: rows[0]
        });
    } catch (err) {
        console.error('Error updating delivery status:', err);
        return res.status(500).json({ error: 'Failed to update delivery status', details: err.message });
    }
};

module.exports = {
    placeOrder,
    cancelOrder,
    getOrderHistory,
    updateOrderOnSuccess,
    getPendingDeliveries,
    updateDeliveryStatus,
};
