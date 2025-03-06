require('dotenv').config();
const { Pool } = require('pg');

// ✅ Define the database connection inside this file
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

const createUsersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    try {
        await pool.query(query);
        console.log('✅ Users table created successfully.');
    } catch (err) {
        console.error('❌ Error creating users table:', err);
    } finally {
        await pool.end(); // ✅ Close the connection after migration
    }
};

createUsersTable();
