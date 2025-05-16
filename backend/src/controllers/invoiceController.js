const nodemailer = require('nodemailer');
const pool = require('../db/pool');
const invoiceDb = require('../db/invoices');

exports.sendInvoiceEmail = async (req, res) => {
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

// ---- New for SCRUM-150: Get invoices by date range (Sales Managers only) ----
exports.getInvoicesByDateRange = async (req, res) => {
    try {
        // Check authentication and authorization
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Sales Managers (role_id = 3) can access this endpoint
        if (req.session.user.role_id !== 3) {
            return res.status(403).json({ error: 'Forbidden: Only Sales Managers can view invoices by date range' });
        }
        
        const { startDate, endDate } = req.query;
        
        // Validate input
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD format' });
        }
        
        // Validate that start date is not after end date
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: 'Start date cannot be after end date' });
        }
        
        const invoices = await invoiceDb.getInvoicesByDateRange(startDate, endDate);
        
        res.status(200).json({ 
            message: 'Invoices retrieved successfully', 
            invoices,
            count: invoices.length,
            dateRange: { startDate, endDate }
        });
    } catch (err) {
        console.error('Error getting invoices by date range:', err);
        res.status(500).json({ error: 'Failed to get invoices', details: err.message });
    }
};

// ---- New for SCRUM-150: Get invoice details by ID (Sales Managers only) ----
exports.getInvoiceById = async (req, res) => {
    try {
        // Check authentication and authorization
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Sales Managers (role_id = 3) can access this endpoint
        if (req.session.user.role_id !== 3) {
            return res.status(403).json({ error: 'Forbidden: Only Sales Managers can view invoice details' });
        }
        
        const { invoiceId } = req.params;
        
        // Validate input
        if (!invoiceId || isNaN(parseInt(invoiceId))) {
            return res.status(400).json({ error: 'Valid invoice ID is required' });
        }
        
        const invoice = await invoiceDb.getInvoiceById(parseInt(invoiceId));
        
        res.status(200).json({ 
            message: 'Invoice retrieved successfully', 
            invoice
        });
    } catch (err) {
        console.error('Error getting invoice details:', err);
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.status(500).json({ error: 'Failed to get invoice details', details: err.message });
    }
};

