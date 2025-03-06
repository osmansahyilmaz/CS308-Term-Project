const pool = require('./pool');

const checkUserExists = async (email, username) => {
    const query = 'SELECT * FROM users WHERE email = $1 OR username = $2';
    return pool.query(query, [email, username]);
};

const createUser = async (username, email, hashedPassword) => {
    const query = `INSERT INTO users (username, email, hashed_password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at`;
    return pool.query(query, [username, email, hashedPassword]);
};

const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    return pool.query(query, [email]);
};

module.exports = {
    checkUserExists,
    createUser,
    getUserByEmail,
};
