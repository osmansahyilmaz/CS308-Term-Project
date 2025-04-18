const express = require('express');
const router = express.Router();
const { sendInvoice } = require('../controllers/invoiceController');

router.post('/email-invoice', sendInvoice);

module.exports = router;
