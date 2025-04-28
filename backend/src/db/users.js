const pool = require('./pool');

const checkUserExists = async (email, username) => {
    const query = 'SELECT * FROM users WHERE email = $1 OR username = $2';
    return pool.query(query, [email, username]);
};

const createUser = async (username, email, hashedPassword, role_id = 1) => {
    const query = `INSERT INTO users (username, email, hashed_password, role_id) 
                   VALUES ($1, $2, $3, $4) RETURNING id, username, email, role_id, created_at`;
    return pool.query(query, [username, email, hashedPassword, role_id]);
};

const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    return pool.query(query, [email]);
};

const getUserById = async (id) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    return pool.query(query, [id]);
};

module.exports = {
    checkUserExists,
    createUser,
    getUserByEmail,
    getUserById
};
