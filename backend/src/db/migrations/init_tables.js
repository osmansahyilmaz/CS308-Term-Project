require('dotenv').config();
const pool = require('../pool');  // ✅ Shared DB connection
const argon2 = require('argon2');

// ✅ Users Table (Adding role_id)
const createUsersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        role_id INT NOT NULL DEFAULT 1,  -- admin (0), Default: Customer (1), Product Manager (2), Sales Manager (3).
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    try {
        await pool.query(query);
        console.log('✅ Users table created/updated.');
    } catch (err) {
        console.error('❌ Error creating users table:', err);
    }
};

// ✅ Session Table (Remains Unchanged)
const createSessionTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
    );`;
    try {
        await pool.query(query);
        console.log('✅ Session table created.');
    } catch (err) {
        console.error('❌ Error creating session table:', err);
    }
};

// ✅ Cart Table (Newly Added)
const createCartTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS cart (
        cart_id SERIAL PRIMARY KEY, -- Unique identifier for each cart entry
        user_id INT REFERENCES users(id) ON DELETE CASCADE, -- Links to users table, deletes cart if user is deleted
        session_id VARCHAR REFERENCES session(sid) ON DELETE CASCADE, -- Links to session table, deletes cart if session is deleted
        product_id INT REFERENCES products(product_id) ON DELETE CASCADE, -- Links to products table, deletes cart if product is deleted
        quantity INT NOT NULL DEFAULT 1, -- Quantity of the product in the cart
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_cart UNIQUE (user_id, session_id, product_id) -- Prevents duplicate entries for the same product
    );`;
    try {
        await pool.query(query);
        console.log('✅ Cart table created/updated.');
    } catch (err) {
        console.error('❌ Error creating cart table:', err);
    }
};

// ✅ Products Table
const createProductsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS products (
        product_id SERIAL PRIMARY KEY, -- Unique identifier for each product
        name VARCHAR(100) NOT NULL, -- Name of the product
        description TEXT, -- Description of the product
        price DECIMAL(10, 2) NOT NULL, -- Original price of the product
        category VARCHAR(50), -- Category of the product (e.g., Electronics, Wearables)
        in_stock BOOLEAN DEFAULT TRUE, -- True if the product is available
        discount INT DEFAULT 0, -- Discount percentage (e.g., 15 for 15% off)
        rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5), -- Average rating (0.0 to 5.0)
        review_count INT DEFAULT 0, -- Total number of reviews
        image VARCHAR(255), -- Main featured image URL
        images TEXT[], -- Array of additional image URLs
        colors TEXT[], -- Array of available colors (e.g., ['Black', 'White'])
        features TEXT[], -- Array of features (e.g., ['Noise Cancellation', 'Bluetooth 5.0'])
        specifications JSONB, -- JSON object for specifications (e.g., {"Driver Size": "40mm"})
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the product was created
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when the product was last updated
    );`;
    try {
        await pool.query(query);
        console.log('✅ Products table created/updated.');
    } catch (err) {
        console.error('❌ Error creating products table:', err);
    }
};

// ✅ Reviews Table (Corrected)
const createReviewsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS reviews (
        review_id SERIAL PRIMARY KEY, -- Unique identifier for each review
        product_id INT NOT NULL, -- Links to the product being reviewed
        user_id INT NOT NULL, -- Links to the user who wrote the review
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date of the review
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Rating (1 to 5)
        title VARCHAR(100), -- Title of the review
        comment TEXT, -- Main content of the review
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE, -- Links to products table
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Links to users table
    );`;
    try {
        await pool.query(query);
        console.log('✅ Reviews table created/updated.');
    } catch (err) {
        console.error('❌ Error creating reviews table:', err);
    }
};

// ✅ Ensure Admin User Exists
const createAdminUser = async () => {
    const adminUsername = "admin";
    const adminEmail = "admin@admin.com";
    const adminPassword = "admin"; // Change this to a secure password
    const hashedPassword = await argon2.hash(adminPassword); // 🔹 Hash password

    const query = `
        INSERT INTO users (username, email, hashed_password, role_id)
        VALUES ($1, $2, $3, 0) 
        ON CONFLICT (email) DO NOTHING;
    `;

    try {
        await pool.query(query, [adminUsername, adminEmail, hashedPassword]);
        console.log('✅ Admin user ensured.');
    } catch (err) {
        console.error('❌ Error creating admin user:', err);
    }
};

// ✅ Run the Migration
const createAllTables = async () => {
    await createUsersTable();  // 🔹 Users table
    await createSessionTable();  // 🔹 Session table
    await createCartTable();  // 🔹 Cart table (Newly added)
    await createProductsTable(); // 🔹 Products table (Newly added)
    await createReviewsTable(); // 🔹 Reviews table (Newly added)
    await createAdminUser(); // 🔹 Admin user insertion
};

module.exports = createAllTables;
