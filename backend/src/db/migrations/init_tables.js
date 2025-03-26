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
    await createCommentsTable();
    await createRatingsTable();
    await createAdminUser();
};

module.exports = createAllTables;
