const pool = require('../db/pool');
const productsDb = require('../db/products');

const getAllProducts = async (req, res) => {
    try {
        const products = await productsDb.getAllProducts();
        res.status(200).json({ products });
    } catch (err) {
        console.error("Error in getAllProducts:", err);
        res.status(500).json({ error: 'Failed to retrieve products' });
    }
};

const getProductDetails = async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await productsDb.getProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ product });
    } catch (err) {
        console.error("Error in getProductDetails:", err);
        res.status(500).json({ error: 'Failed to retrieve product details' });
    }
};

const applyDiscount = async (req, res) => {
    const user = req.session.user;
    if (!user || user.role_id !== 3) {
        return res.status(403).json({ error: 'Only sales managers can apply discounts.' });
    }

    const { productIds, discount } = req.body;

    if (!Array.isArray(productIds) || typeof discount !== 'number' || discount <= 0 || discount >= 100) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        for (const productId of productIds) {
            const result = await pool.query('SELECT price FROM products WHERE product_id = $1', [productId]);
            if (result.rows.length === 0) continue;

            const originalPrice = parseFloat(result.rows[0].price);
            const newPrice = originalPrice * (1 - discount / 100);

            await pool.query(
                'UPDATE products SET discount = $1, price = $2 WHERE product_id = $3',
                [discount, newPrice, productId]
            );

            // Bildirim gönderimi (log olarak)
            const userQuery = await pool.query(
                'SELECT u.email FROM wishlist w JOIN users u ON w.user_id = u.id WHERE w.product_id = $1',
                [productId]
            );

            userQuery.rows.forEach(({ email }) => {
                console.log(`📣 Send email to ${email}: Product ${productId} is now ${discount}% off!`);
            });
        }

        res.status(200).json({ message: 'Discount applied and notifications sent.' });
    } catch (err) {
        console.error("Error in applyDiscount:", err);
        res.status(500).json({ error: 'Failed to apply discount', details: err.message });
    }
};

module.exports = {
    getAllProducts,
    getProductDetails,
    applyDiscount,
};
