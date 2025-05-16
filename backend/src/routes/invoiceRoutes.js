const express = require('express');
const invoiceController = require('../controllers/invoiceController');

const router = express.Router();

// Route to send invoice email
router.post('/sendInvoiceEmail', invoiceController.sendInvoiceEmail);

// ---- New for SCRUM-137: fetch all invoices ----
router.get('/invoices', invoiceController.getInvoices);

// ---- New for SCRUM-150: Get invoices by date range ----
router.get('/invoices/date-range', invoiceController.getInvoicesByDateRange);

// ---- New for SCRUM-151: Generate PDF for a single invoice ----
router.get('/invoices/:invoiceId/generate-pdf', invoiceController.generateInvoicePdf);

// ---- New for SCRUM-151: Generate PDFs for multiple invoices ----
router.post('/invoices/batch-pdf', invoiceController.generateBatchInvoicePdf);

// ---- New for SCRUM-150: Get invoice by ID with detailed information ----
router.get('/invoices/:invoiceId', invoiceController.getInvoiceById);

module.exports = router;