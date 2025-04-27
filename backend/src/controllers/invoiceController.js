const pool = require('../db/pool');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = async (req, res) => {
    const userId = req.session.user?.id;
    const { orderId } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const invoiceQuery = `
            INSERT INTO invoices (order_id, generated_date)
            VALUES ($1, NOW())
            RETURNING invoice_id
        `;
        const result = await pool.query(invoiceQuery, [orderId]);

        res.status(201).json({ message: 'Invoice created', invoiceId: result.rows[0].invoice_id });
    } catch (err) {
        console.error('Error generating invoice:', err);
        res.status(500).json({ error: 'Failed to generate invoice', details: err.message });
    }
};

const emailInvoice = async (req, res) => {
    const userId = req.session.user?.id;
    const { orderId } = req.body;

    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
        const email = userResult.rows[0]?.email;

        const orderResult = await pool.query('SELECT * FROM orders WHERE order_id = $1', [orderId]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Create PDF
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, '../../invoices', `invoice_${orderId}.pdf`);
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Order ID: ${orderId}`);
        doc.text(`User ID: ${userId}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Status: ${orderResult.rows[0].order_status}`);
        doc.end();

        writeStream.on('finish', async () => {
            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const info = await transporter.sendMail({
                from: `"Invoice Bot" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Invoice for Order #${orderId}`,
                text: 'Please find attached your invoice.',
                attachments: [{
                    filename: `invoice_${orderId}.pdf`,
                    path: filePath
                }]
            });

            res.status(200).json({ message: 'Email sent successfully', previewUrl: nodemailer.getTestMessageUrl(info) });
        });

    } catch (err) {
        console.error('Error sending invoice email:', err);
        res.status(500).json({ error: 'Failed to send email', details: err.message });
    }
};

module.exports = {
    generateInvoice,
    emailInvoice
};
