require('dotenv').config();
const pool = require('../pool');  // ✅ Shared DB connection

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

// ✅ Run the Migration
const createAllTables = async () => {
    await createUsersTable();  // 🔹 Users table (Updated)
    await createSessionTable();  // 🔹 Session table
};

module.exports = createAllTables;
