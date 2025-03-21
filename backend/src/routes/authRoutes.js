const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Register a new user
router.post('/auth/register', authController.register);

// Login and initiate session
router.post('/auth/login', authController.login);

// Logout and destroy session
router.post('/auth/logout', authController.logout);

// Retrieve profile of the currently logged-in user
router.get('/auth/profile', authController.getProfile);

module.exports = router;
