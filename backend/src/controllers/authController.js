const argon2 = require('argon2');
const usersDb = require('../db/users');

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const checkResult = await usersDb.checkUserExists(email, username);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password with Argon2
        const hashedPassword = await argon2.hash(password);

        const result = await usersDb.createUser(username, email, hashedPassword);

        res.status(201).json({ 
            message: 'User registered successfully', 
            user: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed', details: err });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await usersDb.getUserByEmail(email);

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
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie('connect.sid');  // Clear the session cookie
        res.json({ message: "Logout successful" });
    });
};

module.exports = {
    register,
    login,
    logout,  // ✅ Export the new logout function
};
