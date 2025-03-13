const argon2 = require('argon2');
const usersDb = require('../db/users');

const register = async (req, res) => {
    const { username, email, password } = req.body;

    // 1. Check if required fields are provided
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // 3. Validate password strength (at least 8 characters, one uppercase, one lowercase, and one number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            error: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number' 
        });
    }

    try {
        // 4. Check if username or email already exists
        const checkResult = await usersDb.checkUserExists(email, username);
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // 5. Hash password using Argon2
        const hashedPassword = await argon2.hash(password);

        // 6. Insert new user into the database
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

    // 1. Check if required fields are provided
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        // 3. Check if user exists
        const result = await usersDb.getUserByEmail(email);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // 4. Validate password
        const isMatch = await argon2.verify(user.hashed_password, password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                username: user.username,
                email: user.email
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
