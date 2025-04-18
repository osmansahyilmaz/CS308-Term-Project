const pool = require('../db/pool');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const sendInvoice = async (req, res) => {
  const userId = req.session.user?.id;
  const { orderId } = req.body;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    // 1) Siparişi ve kullanıcı e‑postayı çek
    const [{ email, order_total_price }] = (await pool.query(
      `SELECT u.email, o.order_total_price
       FROM orders o JOIN users u ON o.user_id = u.id
       WHERE o.order_id = $1 AND o.user_id = $2`,
      [orderId, userId]
    )).rows;
    if (!email) return res.status(404).json({ error: 'Order not found' });

    // 2) PDF oluştur
    const doc = new PDFDocument();
    const pdfPath = path.join(__dirname, '../../invoices', `invoice_${orderId}.pdf`);
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(20).text('INVOICE', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Order ID: ${orderId}`);
    doc.text(`Total: ${order_total_price}₺`).moveDown();
    doc.end();

    // 3) Mail gönder
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"CS308 Invoice" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invoice #${orderId}`,
      text: `Hello,\n\nPlease find your invoice attached for Order #${orderId}.`,
      attachments: [{ filename: `invoice_${orderId}.pdf`, path: pdfPath }]
    });

    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    res.status(200).json({
      message: 'Invoice emailed',
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
  } catch (err) {
    console.error('❌ sendInvoice error:', err);
    res.status(500).json({ error: 'Failed to send invoice', details: err.message });
  }
};

module.exports = { sendInvoice };
