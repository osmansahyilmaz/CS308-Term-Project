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
            COALESCE(AVG(r.rating), 0) AS rating, -- Calculate average rating dynamically
            COUNT(r.rating) AS review_count, -- Count the number of reviews dynamically
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

module.exports = {
    getAllProducts,
    getProductById,
};