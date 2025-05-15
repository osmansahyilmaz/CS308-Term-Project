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
    const { productIds, discount } = req.body;
    if (!Array.isArray(productIds) || typeof discount !== 'number') {
        return res.status(400).json({ error: 'Invalid input' });
    }
    try {
        await productsDb.applyDiscountToProducts(productIds, discount);
        res.status(200).json({ message: 'Discount applied successfully' });
    } catch (err) {
        console.error("Error in applyDiscount:", err);
        res.status(500).json({ error: 'Failed to apply discount' });
    }
};

module.exports = {
    getAllProducts,
    getProductDetails,
    applyDiscount,
};