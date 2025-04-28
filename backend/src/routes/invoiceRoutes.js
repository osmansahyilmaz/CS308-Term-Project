const express = require('express');
const invoiceController = require('../controllers/invoiceController');

const router = express.Router();

// Route to send invoice email
router.post('/sendInvoiceEmail', invoiceController.sendInvoiceEmail);

module.exports = router;