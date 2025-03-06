require('dotenv').config();
const pool = require('../pool');  // ✅ Import shared DB pool

const createUsersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    try {
        await pool.query(query);
        console.log('✅ Users table created successfully.');
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
        console.log('✅ Session table created successfully.');
    } catch (err) {
        console.error('❌ Error creating session table:', err);
    }
};

// Run all table creation scripts
const createAllTables = async () => {
    await createUsersTable();
    await createSessionTable();
};

module.exports = createAllTables;
