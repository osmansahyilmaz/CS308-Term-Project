// backend/src/controllers/productsController.js
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

const deleteProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        const deleted = await productsDb.deleteProduct(productId);
        if (!deleted) {
            return res.status(404).json({ error: 'Product not found' });
        }
        return res.json({ message: 'Product deleted', product: deleted });
    } catch (err) {
        console.error("Error in deleteProduct:", err);
        return res.status(500).json({ error: 'Failed to delete product' });
    }
};

module.exports = {
    getAllProducts,
    getProductDetails,
    deleteProduct,
};
