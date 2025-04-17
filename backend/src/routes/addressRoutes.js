const express = require('express');
const addressController = require('../controllers/addressController');

const router = express.Router();

// Add a new address
router.post('/addresses', addressController.addAddress);

// Update an existing address
router.put('/addresses/:id', addressController.updateAddress);

// Delete an address
router.delete('/addresses/:id', addressController.deleteAddress);

// Get all addresses for a user
router.get('/addresses', addressController.getAllAddresses);

module.exports = router;