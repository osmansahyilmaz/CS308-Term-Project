require('dotenv').config();
const pool = require('../pool');  // ✅ Shared DB connection

// Users Table
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
        console.log('✅ Users table created.');
    } catch (err) {
        console.error('❌ Error creating users table:', err);
    }
};

// Roles Table
const createRolesTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) UNIQUE NOT NULL
    );`;
    try {
        await pool.query(query);
        console.log('✅ Roles table created.');
    } catch (err) {
        console.error('❌ Error creating roles table:', err);
    }
};

// Ensure Default Roles Exist
const insertDefaultRoles = async () => {
    const query = `
    INSERT INTO roles (role_name) 
    SELECT unnest($1::text[])
    WHERE NOT EXISTS (SELECT 1 FROM roles);
    `;
    const roles = ['Customer', 'Product Manager', 'Sales Manager'];
    try {
        await pool.query(query, [roles]);
        console.log('✅ Default roles ensured.');
    } catch (err) {
        console.error('❌ Error inserting default roles:', err);
    }
};

// User Roles Table
const createUserRolesTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS user_roles (
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        role_id INT REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
    );`;
    try {
        await pool.query(query);
        console.log('✅ User roles table created.');
    } catch (err) {
        console.error('❌ Error creating user_roles table:', err);
    }
};

// Session Table
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

// Run all table creation scripts
const createAllTables = async () => {
    await createUsersTable();
    await createRolesTable();
    await insertDefaultRoles();
    await createUserRolesTable();
    await createSessionTable();
};

module.exports = createAllTables;
