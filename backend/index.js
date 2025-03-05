require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

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

app.post('/login', (req, res) => {
    res.json({ message: "Login successful" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
