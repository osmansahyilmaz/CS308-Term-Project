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

      // 2) DB’yi güncelle
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
      const subject = `${name} şimdi %${discount} indirimde!`;
      const text = `${name} ürününün fiyatı ${oldPrice} ₺ → ${newPrice} ₺ oldu. Stoklar bitmeden satın alın!`;

      for (const { email } of users) {
        try {
            await sendMail({
                to: email,
                subject: `${name} şimdi %${discount} indirimde!`,
                text: `${name} ürününün fiyatı ${oldPrice} ₺ → ${newPrice} ₺ oldu. Hemen incele!`
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


module.exports = {
    getAllProducts,
    getProductDetails,
    applyDiscount,
};
