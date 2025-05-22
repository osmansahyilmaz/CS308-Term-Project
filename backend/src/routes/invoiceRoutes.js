const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const invoiceDb = require('../db/invoices');

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

// Add this route for date range queries
router.get('/invoices', async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    try {
        const invoices = await invoiceDb.getInvoicesByDateRange(startDate, endDate);
        // Optionally, map/format as needed for frontend
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch invoices', details: err.message });
    }
});

module.exports = router;