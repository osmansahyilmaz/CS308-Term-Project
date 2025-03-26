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
    await createAdminUser(); // 🔹 Admin user insertion
};

module.exports = createAllTables;
