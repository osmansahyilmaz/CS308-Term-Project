require('dotenv').config(); // Load environment variables from .env
const { Pool } = require('pg');

// Create a new PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// Test the database connection
pool.connect()
    .then(client => {
        console.log('Connected to PostgreSQL');
        client.release(); // Release the client back to the pool
    })
    .catch(err => console.error('Database connection error:', err));

module.exports = pool; // Export pool to be used in other files
