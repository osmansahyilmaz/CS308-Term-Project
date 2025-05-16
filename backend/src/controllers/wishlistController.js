const pool = require('../db/pool');

// Add product to wishlist
const addToWishlist = async (req, res) => {
    const userId = req.session.user?.id;
    const { productId } = req.body;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    try {
        await pool.query(`
            INSERT INTO wishlist (user_id, product_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        `, [userId, productId]);

        res.status(201).json({ message: 'Product added to wishlist' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add to wishlist', details: err.message });
    }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    const userId = req.session.user?.id;
    const { productId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    try {
        await pool.query(`
            DELETE FROM wishlist
            WHERE user_id = $1 AND product_id = $2
        `, [userId, productId]);

        res.status(200).json({ message: 'Product removed from wishlist' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove from wishlist', details: err.message });
    }
};

// Get wishlist items
const getWishlist = async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const result = await pool.query(`
            SELECT w.product_id, p.name, p.price, p.discount, p.image
            FROM wishlist w
            JOIN products p ON w.product_id = p.product_id
            WHERE w.user_id = $1
        `, [userId]);

        res.status(200).json({ wishlist: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get wishlist', details: err.message });
    }
};

module.exports = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
