const pool = require('./pool');

const getAllProducts = async () => {
    const query = `
        SELECT 
            product_id, 
            name, 
            description, 
            price, 
            category, 
            in_stock, 
            discount, 
            image, 
            images, 
            colors, 
            features, 
            specifications, 
            created_at, 
            updated_at
        FROM products
        ORDER BY created_at DESC;
    `;
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        throw new Error('Error retrieving products: ' + err.message);
    }
};

const getProductById = async (productId) => {
    const query = `
        SELECT 
            p.product_id, 
            p.name, 
            p.description, 
            p.price, 
            p.category, 
            p.in_stock, 
            p.discount, 
            COALESCE(AVG(r.rating), 0) AS rating,
            COUNT(r.rating) AS review_count,
            p.image, 
            p.images, 
            p.colors, 
            p.features, 
            p.specifications, 
            p.created_at, 
            p.updated_at,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', r.review_id,
                        'user', u.username,
                        'rating', r.rating,
                        'title', r.title,
                        'comment', r.comment,
                        'date', r.date
                    )
                ) FILTER (WHERE r.review_id IS NOT NULL), 
                '[]'
            ) AS reviews
        FROM products p
        LEFT JOIN reviews r ON p.product_id = r.product_id
        LEFT JOIN users u ON r.user_id = u.id
        WHERE p.product_id = $1
        GROUP BY p.product_id
    `;
    try {
        const result = await pool.query(query, [productId]);
        return result.rows[0];
    } catch (err) {
        throw new Error('Error retrieving product details: ' + err.message);
    }
};

const applyDiscountToProducts = async (productIds, discountRate) => {
    if (!Array.isArray(productIds) || typeof discountRate !== 'number') {
        throw new Error('Invalid input');
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const productId of productIds) {
            const result = await client.query('SELECT price FROM products WHERE product_id = $1', [productId]);
            if (result.rows.length === 0) continue;

            const originalPrice = parseFloat(result.rows[0].price);
            const newPrice = parseFloat((originalPrice * (1 - discountRate / 100)).toFixed(2));

            await client.query(
                'UPDATE products SET discount = $1, price = $2 WHERE product_id = $3',
                [discountRate, newPrice, productId]
            );
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw new Error('Error applying discount to products: ' + err.message);
    } finally {
        client.release();
    }
};

// Create a new product with full details
const createProduct = async (productData) => {
    const { 
        name, 
        model, 
        serial_number, 
        description, 
        price, 
        quantity, 
        warranty, 
        distributor, 
        cost,
        category = 'other',
        image = null,
        images = [],
        colors = [],
        features = {},
        specifications = {}
    } = productData;

    const query = `
        INSERT INTO products (
            name, 
            model, 
            serial_number, 
            description, 
            price, 
            in_stock, 
            warranty, 
            distributor, 
            cost,
            category,
            image,
            images,
            colors,
            features,
            specifications
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING 
            product_id, 
            name, 
            model, 
            serial_number, 
            description, 
            price, 
            in_stock, 
            warranty, 
            distributor, 
            cost,
            category,
            image,
            images,
            colors,
            features,
            specifications,
            created_at;
    `;

    try {
        const values = [
            name, 
            model, 
            serial_number, 
            description, 
            price, 
            quantity, // in_stock
            warranty, 
            distributor, 
            cost,
            category,
            image,
            JSON.stringify(images),
            JSON.stringify(colors),
            JSON.stringify(features),
            JSON.stringify(specifications)
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw new Error('Error creating product: ' + err.message);
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    applyDiscountToProducts,
    createProduct,
};
