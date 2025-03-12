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

        // Create user in DB
        const result = await usersDb.createUser(username, email, hashedPassword);
        const newUser = result.rows[0];

        res.status(201).json({
            message: 'User registered successfully', 
            user: {
                username: newUser.username,
                email: newUser.email,
                created_at: newUser.created_at
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed', details: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const result = await usersDb.getUserByEmail(email);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const isMatch = await argon2.verify(user.hashed_password, password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Store user info in session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role_id: user.role_id
        };

        res.status(200).json({
            message: 'Login successful',
            user: {
                username: user.username,
                email: user.email,
                role_id: user.role_id
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
};

const logout = (req, res) => {
    // If no user is logged in, return 401
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }

        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout successful' });
    });
};

const getProfile = (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // Return user data from session
    res.status(200).json({
        user: req.session.user
    });
};

module.exports = {
    register,
    login,
    logout,
    getProfile
};
