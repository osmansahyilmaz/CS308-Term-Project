require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const argon2 = require('argon2');  // ✅ Only Argon2 is needed

const app = express();
const port = 5000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Database connection error:', err));

app.use(express.json());

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const checkQuery = 'SELECT * FROM users WHERE email = $1 OR username = $2';
        const checkResult = await pool.query(checkQuery, [email, username]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password with Argon2 (automatic salting)
        const hashedPassword = await argon2.hash(password);

        const query = `INSERT INTO users (username, email, hashed_password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at`;
        const result = await pool.query(query, [username, email, hashedPassword]);

        res.status(201).json({ 
            message: 'User registered successfully', 
            user: result.rows[0]  // ✅ Only returning required fields
        });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed', details: err });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = $1';

    try {
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isMatch = await argon2.verify(user.hashed_password, password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ message: "Login successful" });
    } catch (err) {
        res.status(500).json({ error: 'Login failed', details: err });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
