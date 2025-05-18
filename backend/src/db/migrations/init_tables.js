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

const createProductsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS products (
        product_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2), -- allow NULL
        category VARCHAR(50),
        in_stock INT DEFAULT 0,
        discount INT DEFAULT 0,
        image VARCHAR(255),
        images TEXT[],
        colors TEXT[],
        features TEXT[],
        specifications JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    try {
        await pool.query(query);
        console.log('✅ Products table created/updated.');
    } catch (err) {
        console.error('❌ Error creating products table:', err);
    }
};

const createCartTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS cart (
        cart_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR REFERENCES session(sid) ON DELETE CASCADE,
        product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_cart UNIQUE (user_id, session_id, product_id)
    );`;
    try {
        await pool.query(query);
        console.log('✅ Cart table created/updated.');
    } catch (err) {
        console.error('❌ Error creating cart table:', err);
    }
};

const createReviewsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS reviews (
        review_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(100),
        comment TEXT,
        status VARCHAR(20) DEFAULT 'PENDING',
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`;
    try {
        await pool.query(query);
        console.log('✅ Reviews table created/updated.');
    } catch (err) {
        console.error('❌ Error creating reviews table:', err);
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

const createOrdersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        order_total_price DECIMAL(10, 2) NOT NULL,
        order_tax_amount INT,
        order_status INT NOT NULL DEFAULT 0,
        order_processing_date TIMESTAMP,
        order_in_transit_date TIMESTAMP,
        order_delivered_date TIMESTAMP,
        order_shipping_code VARCHAR(255),
        order_shipping_price INT,
        order_shipping_address VARCHAR(100) -- Changed from INT REFERENCES addresses(address_id)
    );`;
    try {
        await pool.query(query);
        console.log('✅ Orders table created/updated.');
    } catch (err) {
        console.error('❌ Error creating orders table:', err);
    }
};

const createProductsOfOrderTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS products_of_order (
        product_of_order_id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
        product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
        price_when_buy DECIMAL(10, 2) NOT NULL, -- Changed to DECIMAL(10, 2)
        tax_when_buy DECIMAL(10, 2), -- Changed to DECIMAL(10, 2)
        discount_when_buy DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Changed to DECIMAL(10, 2)
        product_order_count INT NOT NULL
    );`;
    try {
        await pool.query(query);
        console.log('✅ ProductsOfOrder table created/updated.');
    } catch (err) {
        console.error('❌ Error creating products_of_order table:', err);
    }
};

const createInvoicesTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS invoices (
        invoice_id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
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

const createPaymentsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS payments (
        payment_id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
        payment_method VARCHAR(50) NOT NULL,
        payment_status INT NOT NULL DEFAULT 0,
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

const createWishlistTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS wishlist (
            wishlist_id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_wishlist UNIQUE (user_id, product_id)
        );
    `;
    try {
        await pool.query(query);
        console.log('✅ Wishlist table created/updated.');
    } catch (err) {
        console.error('❌ Error creating wishlist table:', err);
    }
};

const createCategoriesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL
        );
    `;
    try {
        await pool.query(query);
        console.log('✅ Categories table created/updated.');
    } catch (err) {
        console.error('❌ Error creating categories table:', err);
    }
};

const createAllTables = async () => {
    await createUsersTable();
    await createAddressesTable();
    await createSessionTable();
    await createCategoriesTable();
    await createProductsTable();
    await createCartTable();
    await createReviewsTable();
    await createCommentsTable();
    await createOrdersTable();
    await createProductsOfOrderTable();
    await createInvoicesTable(); // 🔧 user_id dahil
    await createPaymentsTable();
    await createAdminUser();
    await createWishlistTable();

};

module.exports = createAllTables;