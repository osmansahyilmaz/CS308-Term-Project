const { sendMail } = require('../utils/emailService');
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
  if (!Array.isArray(productIds) || discount <= 0 || discount >= 100) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    for (const productId of productIds) {
      // 1) Eski fiyatı al
      const { rows } = await pool.query(
        'SELECT name, price FROM products WHERE product_id = $1',
        [productId]
      );
      if (!rows.length) continue;

      const { name, price: oldPrice } = rows[0];
      const newPrice = (oldPrice * (1 - discount / 100)).toFixed(2);

      // 2) DB'yi güncelle
      await pool.query(
        'UPDATE products SET discount = $1, price = $2 WHERE product_id = $3',
        [discount, newPrice, productId]
      );

      // 3) O ürünü wishliste ekleyen kullanıcıların e-postalarını getir
      const { rows: users } = await pool.query(`
        SELECT u.email 
        FROM wishlist w 
        JOIN users u ON u.id = w.user_id
        WHERE w.product_id = $1
      `, [productId]);

      // 4) Hepsine mail at
      const subject = `${name} is now %${discount} off!`;
      const text = `${name} was just reduced from ${oldPrice} ₺ to ${newPrice} ₺ .Grab yours before it’s gone!`;

      for (const { email } of users) {
        try {
            await sendMail({
                to: email,
                subject: `${name} is now %${discount} off!`,
                text: `${name} was just reduced from ${oldPrice} ₺ to ${newPrice} ₺ .Grab yours before it’s gone!`
            });
        } catch (mailErr) {
          console.error(`❌ Mail failed for ${email}:`, mailErr);
        }
      }
    }

    res.status(200).json({ message: 'Discount applied and emails sent.' });
  } catch (err) {
    console.error('Error in applyDiscount:', err);
    res.status(500).json({ error: 'Failed to apply discount' });
  }
};

// Create a new product with only allowed fields, price is not set
const createProduct = async (req, res) => {
    try {
        // Check authentication and authorization
 /*       if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        // Only Product Managers (role_id = 2) can add products
        if (req.session.user.role_id !== 2) {
            return res.status(403).json({ error: 'Forbidden: Only Product Managers can add products' });
        } */

        const { 
            name, 
            description, 
            category,
            in_stock,
            discount,
            image,
            images,
            colors,
            features,
            specifications
        } = req.body;

        // Validate required fields
        if (!name || !description) {
            return res.status(400).json({ 
                error: 'Missing required fields', 
                required: [
                    'name', 'description'
                ] 
            });
        }

        const productData = {
            name, 
            description, 
            category,
            in_stock,
            discount,
            image,
            images,
            colors,
            features,
            specifications
        };

        const product = await productsDb.createProduct(productData);

        res.status(201).json({ 
            message: 'Product created successfully. Awaiting price set by sales manager.', 
            product 
        });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Failed to create product', details: err.message });
    }
};

// Update product stock levels
const updateProductStock = async (req, res) => {
    try {
        // Check authentication and authorization
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Product Managers (role_id = 2) can update stock levels
        if (req.session.user.role_id !== 2) {
            return res.status(403).json({ error: 'Forbidden: Only Product Managers can update stock levels' });
        }
        
        const { productId } = req.params;
        const { quantity } = req.body;
        
        // Validate input
        if (quantity === undefined || quantity === null) {
            return res.status(400).json({ error: 'Stock quantity is required' });
        }
        
        if (isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
            return res.status(400).json({ error: 'Stock quantity must be a positive integer' });
        }
        
        const updatedProduct = await productsDb.updateProductStock(productId, parseInt(quantity));
        
        res.status(200).json({ 
            message: 'Product stock updated successfully', 
            product: updatedProduct
        });
    } catch (err) {
        console.error('Error updating product stock:', err);
        res.status(500).json({ error: 'Failed to update product stock', details: err.message });
    }
};

// Set initial price for a newly added product
const setInitialPrice = async (req, res) => {
    try {
        // Check authentication and authorization
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Sales Managers (role_id = 3) can set initial prices
        if (req.session.user.role_id !== 3) {
            return res.status(403).json({ error: 'Forbidden: Only Sales Managers can set initial prices for products' });
        }
        
        const { productId } = req.params;
        const { price } = req.body;
        
        // Validate input
        if (price === undefined || price === null) {
            return res.status(400).json({ error: 'Price is required' });
        }
        
        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            return res.status(400).json({ error: 'Price must be a positive number' });
        }
        
        const updatedProduct = await productsDb.setInitialPrice(productId, parseFloat(price));
        
        res.status(200).json({ 
            message: 'Initial product price set successfully', 
            product: updatedProduct
        });
    } catch (err) {
        console.error('Error setting initial product price:', err);
        res.status(500).json({ error: 'Failed to set initial product price', details: err.message });
    }
};

// Update price of an existing product
const updateProductPrice = async (req, res) => {
    try {
        // Check authentication and authorization
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Sales Managers (role_id = 3) can update product prices
        if (req.session.user.role_id !== 3) {
            return res.status(403).json({ error: 'Forbidden: Only Sales Managers can update product prices' });
        }
        
        const { productId } = req.params;
        const { price } = req.body;
        
        // Validate input
        if (price === undefined || price === null) {
            return res.status(400).json({ error: 'Price is required' });
        }
        
        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            return res.status(400).json({ error: 'Price must be a positive number' });
        }
        
        const updatedProduct = await productsDb.updateProductPrice(productId, parseFloat(price));
        
        res.status(200).json({ 
            message: 'Product price updated successfully', 
            product: updatedProduct
        });
    } catch (err) {
        console.error('Error updating product price:', err);
        res.status(500).json({ error: 'Failed to update product price', details: err.message });
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

// controllers/productsController.js
const getUnpricedProducts = async (req, res) => {
  console.log('▶ getUnpricedProducts — entered');   // <-- EKLEDİM
  try {
    const products = await productsDb.getUnpricedProducts();
    console.log('⏹ getUnpricedProducts — rows:', products.length);   // <-- EKLEDİM
    res.status(200).json({ products });
  } catch (err) {
    console.error('❌ getUnpricedProducts error:', err);   // zaten vardı
    res.status(500).json({ error: 'Failed to retrieve unpriced products' });
  }
};


module.exports = {
    getUnpricedProducts,
    getAllProducts,
    getProductDetails,
    applyDiscount,
    createProduct,
    updateProductStock,
    setInitialPrice,
    updateProductPrice,
    deleteProduct,
};
