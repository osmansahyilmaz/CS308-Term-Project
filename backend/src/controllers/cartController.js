const pool = require('../db/pool');

// Get the current user's cart
const getCart = async (req, res) => {
    const userId = req.session.user?.id;
    const sessionId = req.sessionID;

    try {
        const query = `
            SELECT * FROM cart
            WHERE user_id = $1 OR session_id = $2
        `;
        const result = await pool.query(query, [userId, sessionId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

// Add a product to the cart
const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.user?.id;
    const sessionId = req.sessionID;

    try {
        const query = `
            INSERT INTO cart (user_id, session_id, product_id, quantity)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, session_id, product_id)
            DO UPDATE SET quantity = cart.quantity + $4
        `;
        await pool.query(query, [userId, sessionId, productId, quantity]);
        res.status(200).json({ message: 'Product added to cart' });
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ error: 'Failed to add product to cart' });
    }
};

// Remove a product from the cart
const removeFromCart = async (req, res) => {
    const { productId } = req.body;
    const userId = req.session.user?.id;
    const sessionId = req.sessionID;

    try {
        const query = `
            DELETE FROM cart
            WHERE (user_id = $1 OR session_id = $2) AND product_id = $3
        `;
        await pool.query(query, [userId, sessionId, productId]);
        res.status(200).json({ message: 'Product removed from cart' });
    } catch (err) {
        console.error('Error removing from cart:', err);
        res.status(500).json({ error: 'Failed to remove product from cart' });
    }
};

// Clear the cart
const clearCart = async (req, res) => {
    const userId = req.session.user?.id;
    const sessionId = req.sessionID;

    try {
        const query = `
            DELETE FROM cart
            WHERE user_id = $1 OR session_id = $2
        `;
        await pool.query(query, [userId, sessionId]);
        res.status(200).json({ message: 'Cart cleared' });
    } catch (err) {
        console.error('Error clearing cart:', err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};

// Merge session-based cart with user-based cart after login
const mergeCart = async (req, res) => {
    const userId = req.session.user?.id; // Logged-in user's ID
    const sessionId = req.sessionID; // Current session ID

    if (!userId) {
        return res.status(400).json({ error: 'User must be logged in to merge cart' });
    }

    try {
        // Update session-based cart to associate with the logged-in user
        const updateQuery = `
            UPDATE cart
            SET user_id = $1, session_id = NULL
            WHERE session_id = $2
        `;
        await pool.query(updateQuery, [userId, sessionId]);

        // Merge duplicate products (same product_id) by summing their quantities
        const mergeQuery = `
            DELETE FROM cart
            WHERE cart_id IN (
                SELECT c1.cart_id
                FROM cart c1
                JOIN cart c2
                ON c1.product_id = c2.product_id
                AND c1.user_id = c2.user_id
                AND c1.session_id IS NULL
                AND c2.session_id IS NULL
                AND c1.cart_id > c2.cart_id
            );
        `;
        await pool.query(mergeQuery);

        res.status(200).json({ message: 'Cart merged successfully' });
    } catch (err) {
        console.error('Error merging cart:', err);
        res.status(500).json({ error: 'Failed to merge cart' });
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    mergeCart,
};