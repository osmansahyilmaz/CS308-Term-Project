// backend/src/routes/invoiceRoutes.js
const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const router = express.Router();

// Send invoice email
router.post('/sendInvoiceEmail', invoiceController.sendInvoiceEmail);

// ---- New for SCRUM-137: fetch all invoices ----
router.get('/invoices', invoiceController.getInvoices);

module.exports = router;
