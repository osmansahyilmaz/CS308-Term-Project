// File: backend/src/db/migrations/init_tables.js

require('dotenv').config();
const pool = require('../pool');
const argon2 = require('argon2');

const createUsersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        role_id INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    try {
        await pool.query(query);
        console.log('✅ Users table created/updated.');
    } catch (err) {
        console.error('❌ Error creating users table:', err);
    }
};

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

const createCommentsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS comments (
        comment_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`;
    try {
        await pool.query(query);
        console.log('✅ Comments table created/updated.');
    } catch (err) {
        console.error('❌ Error creating comments table:', err);
    }
};

const createRatingsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS ratings (
        rating_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        rating_value INT NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`;
    try {
        await pool.query(query);
        console.log('✅ Ratings table created/updated.');
    } catch (err) {
        console.error('❌ Error creating ratings table:', err);
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
        in_stock INT DEFAULT 0, -- Quantity of the product in stock
        discount INT DEFAULT 0, -- Discount percentage (e.g., 15 for 15% off)
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

// ✅ Orders Table
const createOrdersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        order_total_price INT NOT NULL,
        order_tax_amount INT,
        order_status INT NOT NULL DEFAULT 0, -- 0: verifying, 1: processing, 2: in-transit, 3: delivered
        order_processing_date TIMESTAMP,
        order_in_transit_date TIMESTAMP,
        order_delivered_date TIMESTAMP,
        order_shipping_code VARCHAR(255),
        order_shipping_price INT,
        order_shipping_address INT REFERENCES addresses(address_id) ON DELETE SET NULL
    );`;
    try {
        await pool.query(query);
        console.log('✅ Orders table created/updated.');
    } catch (err) {
        console.error('❌ Error creating orders table:', err);
    }
};

// ✅ ProductsOfOrder Table
const createProductsOfOrderTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS products_of_order (
        product_of_order_id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
        product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
        price_when_buy INT NOT NULL,
        tax_when_buy INT,
        discount_when_buy INT NOT NULL,
        product_order_count INT NOT NULL
    );`;
    try {
        await pool.query(query);
        console.log('✅ ProductsOfOrder table created/updated.');
    } catch (err) {
        console.error('❌ Error creating products_of_order table:', err);
    }
};

// ✅ Invoices Table
const createInvoicesTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS invoices (
        invoice_id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
        generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        invoice_description TEXT,
        invoice_pdf_url VARCHAR(255)
    );`;
    try {
        await pool.query(query);
        console.log('✅ Invoices table created/updated.');
    } catch (err) {
        console.error('❌ Error creating invoices table:', err);
    }
};

// ✅ Payments Table
const createPaymentsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS payments (
        payment_id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
        payment_method VARCHAR(50) NOT NULL,
        payment_status INT NOT NULL DEFAULT 0, -- 0: pending, 1: success, 2: failed
        payment_date TIMESTAMP,
        transaction_code VARCHAR(255)
    );`;
    try {
        await pool.query(query);
        console.log('✅ Payments table created/updated.');
    } catch (err) {
        console.error('❌ Error creating payments table:', err);
    }
};

// ✅ Addresses Table
const createAddressesTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS addresses (
        address_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        address_title VARCHAR(100) NOT NULL,
        address_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        address_city VARCHAR(100) NOT NULL,
        address_district VARCHAR(100) NOT NULL,
        address_neighbourhood VARCHAR(100) NOT NULL,
        address_main_street VARCHAR(255),
        address_street VARCHAR(255),
        address_building_number VARCHAR(50) NOT NULL,
        address_floor INT,
        address_apartment_number VARCHAR(50),
        address_post_code INT NOT NULL,
        address_contact_phone VARCHAR(15) NOT NULL,
        address_contact_name VARCHAR(100) NOT NULL,
        address_contact_surname VARCHAR(100) NOT NULL
    );`;
    try {
        await pool.query(query);
        console.log('✅ Addresses table created/updated.');
    } catch (err) {
        console.error('❌ Error creating addresses table:', err);
    }
};

// ✅ Ensure Admin User Exists
const createAdminUser = async () => {
    const adminUsername = "admin";
    const adminEmail = "admin@admin.com";
    const adminPassword = "admin";
    const hashedPassword = await argon2.hash(adminPassword);

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

const createAllTables = async () => {
    await createUsersTable();
    await createSessionTable();
    await createProductsTable();
    await createCartTable();
    await createReviewsTable();
    await createCommentsTable();
    await createRatingsTable();
    await createOrdersTable(); // 🔹 Orders table
    await createProductsOfOrderTable(); // 🔹 ProductsOfOrder table
    await createInvoicesTable(); // 🔹 Invoices table
    await createPaymentsTable(); // 🔹 Payments table
    await createAddressesTable(); // 🔹 Addresses table
    await createAdminUser();
};

module.exports = createAllTables;
