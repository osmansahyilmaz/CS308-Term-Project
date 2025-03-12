const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Register a new user
router.post('/register', authController.register);

// Login and initiate session
router.post('/login', authController.login);

// Logout and destroy session
router.post('/logout', authController.logout);

// Retrieve profile of the currently logged-in user
router.get('/profile', authController.getProfile);

module.exports = router;
