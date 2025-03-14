const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Register a new user
router.post('/api/register', authController.register);

// Login and initiate session
router.post('/api/login', authController.login);

// Logout and destroy session
router.post('/api/logout', authController.logout);

// Retrieve profile of the currently logged-in user
router.get('/api/profile', authController.getProfile);

module.exports = router;
