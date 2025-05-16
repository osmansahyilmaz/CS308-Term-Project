const express = require('express');
const productController = require('../controllers/productsController');

const router = express.Router();

// Retrieve all products
router.get('/products', productController.getAllProducts);

// Retrieve product details by id
router.get('/products/:productId', productController.getProductDetails);

// Apply discount to selected products (multiple)
router.post('/products/discount', productController.applyDiscount);

// Create a new product with full details
router.post('/products', productController.createProduct);

// Update product stock levels
router.put('/products/:productId/stock', productController.updateProductStock);

module.exports = router;