const nodemailer = require('nodemailer');

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

