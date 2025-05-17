const express = require('express');
const invoiceController = require('../controllers/invoiceController');

const router = express.Router();

// Route to send invoice email
router.post('/sendInvoiceEmail', invoiceController.sendInvoiceEmail);

// Save invoice PDF to the invoices table
router.post('/save-invoice-pdf', invoiceController.saveInvoicePdf);

// Get invoice by order ID
router.get('/by-order/:orderId', invoiceController.getInvoiceByOrderId);

module.exports = router;