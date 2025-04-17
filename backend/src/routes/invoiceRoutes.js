const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.post('/email-invoice', invoiceController.generateInvoice);

module.exports = router;
