// backend/src/routes/productsRoutes.js
const express = require('express');
const productController = require('../controllers/productsController');

const router = express.Router();

// Retrieve all products
router.get('/products', productController.getAllProducts);

// Retrieve product details by id
router.get('/products/:productId', productController.getProductDetails);

// Delete a product by id
router.delete('/products/:productId', productController.deleteProduct);

module.exports = router;
