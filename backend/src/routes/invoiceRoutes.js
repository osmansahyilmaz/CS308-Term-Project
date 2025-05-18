const express = require('express');
const invoiceController = require('../controllers/invoiceController');

const router = express.Router();

// Route to send invoice email
router.post('/sendInvoiceEmail', invoiceController.sendInvoiceEmail);

// Save invoice PDF to the invoices table
router.post('/invoices/save-invoice-pdf', invoiceController.saveInvoicePdf);

// Get invoice by order ID
router.get('/invoices/by-order/:orderId', invoiceController.getInvoiceByOrderId);

// Get all invoices (for Sales Managers)
router.get('/invoices/all', invoiceController.getAllInvoices);

// Get a specific invoice by ID (for Sales Managers or the invoice owner)
router.get('/invoices/:invoiceId', invoiceController.getInvoiceById);

module.exports = router;