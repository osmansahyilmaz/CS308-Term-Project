const nodemailer = require('nodemailer');
const pool = require('../db/pool');
const invoiceDb = require('../db/invoices');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const sendInvoiceEmail = async (req, res) => {
    const { to, invoiceNumber, pdfData } = req.body;

    console.log("📩 Received email request:", { to, invoiceNumber }); // Debugging log
    console.log("📄 Received PDF Data (Base64):", pdfData.substring(0, 50) + "..."); // Debugging log

    if (!to || !invoiceNumber || !pdfData) {
        console.error("❌ Missing required fields:", { to, invoiceNumber, pdfData }); // Debugging log
        return res.status(400).json({ error: 'Missing required fields' });
    }

    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.example.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // Use true for 465 false for other ports
        auth: {
            user: process.env.SMTP_USER || 'your_email@example.com',
            pass: process.env.SMTP_PASS || 'your_email_password'
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_FROM || '"Online Store" <no-reply@example.com>',
        to,
        subject: `Invoice #${invoiceNumber}`,
        text: `Please find attached your invoice #${invoiceNumber}.`,
        attachments: [{
            filename: `invoice-${invoiceNumber}.pdf`,
            content: pdfData.split(',')[1], // Remove the Base64 prefix
            encoding: 'base64'
        }]
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info.response); // Debugging log
        res.status(200).json({ message: 'Invoice emailed successfully', info });
    } catch (error) {
        console.error("❌ Error sending email:", error); // Debugging log
        res.status(500).json({ error: 'Error sending email', details: error.message });
    }
};


// Save invoice PDF to the invoices table
const saveInvoicePdf = async (req, res) => {
    const { invoiceId, pdfData } = req.body;
    if (!invoiceId || !pdfData) {
        return res.status(400).json({ error: 'invoiceId and pdfData are required' });
    }
    try {
        // Save the PDF data (as base64 or a file URL, depending on your schema)
        await pool.query(
            'UPDATE invoices SET invoice_pdf_url = $1 WHERE invoice_id = $2',
            [pdfData, invoiceId]
        );
        res.json({ message: 'Invoice PDF saved successfully' });
    } catch (err) {
        console.error('Error saving invoice PDF:', err);
        res.status(500).json({ error: 'Failed to save invoice PDF' });
    }
};

// Get invoice by order ID
const getInvoiceByOrderId = async (req, res) => {
    const { orderId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM invoices WHERE order_id = $1 LIMIT 1',
            [orderId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found for this order' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching invoice by order ID:', err);
        res.status(500).json({ error: 'Failed to fetch invoice by order ID' });
    }
};

module.exports = {
    sendInvoiceEmail,
    saveInvoicePdf,
    getInvoiceByOrderId
};

