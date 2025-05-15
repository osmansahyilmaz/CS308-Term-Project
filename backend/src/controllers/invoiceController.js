// backend/src/controllers/invoiceController.js
const nodemailer = require('nodemailer');
const pool = require('../db/pool');

// Send invoice email (existing)
exports.sendInvoiceEmail = async (req, res) => {
  const { to, invoiceNumber, pdfData } = req.body;
  if (!to || !invoiceNumber || !pdfData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  let mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Invoice #${invoiceNumber}`,
    text: `Please find attached your invoice #${invoiceNumber}.`,
    attachments: [{
      filename: `invoice-${invoiceNumber}.pdf`,
      content: pdfData.split(',')[1],
      encoding: 'base64'
    }]
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Invoice emailed successfully', info });
  } catch (err) {
    console.error('Error sending invoice email:', err);
    res.status(500).json({ error: 'Error sending email', details: err.message });
  }
};

// ---- New for SCRUM-137: fetch all invoices (admin only) ----
exports.getInvoices = async (req, res) => {
  const user = req.session.user;
  if (!user || user.role_id !== 0) {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  try {
    const { rows } = await pool.query(`
      SELECT
        i.invoice_id,
        i.order_id,
        i.user_id,
        u.username,
        u.email,
        i.generated_date,
        i.invoice_description,
        i.invoice_pdf_url
      FROM invoices i
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.generated_date DESC;
    `);
    return res.json({ invoices: rows });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return res.status(500).json({ error: 'Database error', details: err.message });
  }
};
