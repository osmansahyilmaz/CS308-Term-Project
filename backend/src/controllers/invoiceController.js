const nodemailer = require('nodemailer');
const pool = require('../db/pool');
const invoiceDb = require('../db/invoices');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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

// ---- New for SCRUM-151: Generate PDF for an invoice ----
exports.generateInvoicePdf = async (req, res) => {
    try {
        // Check authentication and authorization
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Sales Managers (role_id = 3) can generate invoice PDFs
        if (req.session.user.role_id !== 3) {
            return res.status(403).json({ error: 'Forbidden: Only Sales Managers can generate invoice PDFs' });
        }
        
        const { invoiceId } = req.params;
        
        // Validate input
        if (!invoiceId || isNaN(parseInt(invoiceId))) {
            return res.status(400).json({ error: 'Valid invoice ID is required' });
        }
        
        // Get invoice data with PDF metadata
        const pdfMetadata = await invoiceDb.generateInvoicePdfMetadata(parseInt(invoiceId));
        const invoice = pdfMetadata.contentData;
        
        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Ensure uploads directory exists
        const uploadDir = path.join(__dirname, '../../uploads/invoices');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Create a write stream for the PDF
        const pdfPath = path.join(uploadDir, pdfMetadata.fileName);
        const pdfStream = fs.createWriteStream(pdfPath);
        
        // Pipe PDF document to a file
        doc.pipe(pdfStream);
        
        // Set PDF metadata
        doc.info = {
            Title: pdfMetadata.title,
            Author: pdfMetadata.author,
            Subject: pdfMetadata.subject,
            Keywords: pdfMetadata.keywords,
            CreationDate: pdfMetadata.creationDate,
            ModDate: pdfMetadata.modificationDate,
            Creator: pdfMetadata.creator,
            Producer: pdfMetadata.producer
        };
        
        // Add company header
        doc.fontSize(20).text('Online Store', { align: 'center' });
        doc.fontSize(12).text('123 E-Commerce St, Internet City', { align: 'center' });
        doc.text('support@onlinestore.com | +1 (555) 123-4567', { align: 'center' });
        doc.moveDown(2);
        
        // Add invoice title and details
        doc.fontSize(16).text(`INVOICE #${invoice.invoice_id}`, { align: 'center' });
        doc.moveDown();
        
        // Add invoice info table
        doc.fontSize(10);
        doc.text(`Order ID: ${invoice.order_id}`);
        doc.text(`Invoice Date: ${new Date(invoice.generated_date).toLocaleDateString()}`);
        doc.text(`Status: ${getOrderStatusText(invoice.order_status)}`);
        doc.moveDown();
        
        // Add customer info
        doc.fontSize(12).text('Customer Information:', { underline: true });
        doc.fontSize(10);
        doc.text(`Name: ${invoice.username}`);
        doc.text(`Email: ${invoice.email}`);
        doc.text(`Shipping Address: ${formatAddress(invoice)}`);
        doc.moveDown();
        
        // Add product table header
        doc.fontSize(12).text('Ordered Products:', { underline: true });
        doc.moveDown(0.5);
        
        // Set up table layout
        const tableTop = doc.y;
        const itemX = 50;
        const descriptionX = 150;
        const quantityX = 280;
        const priceX = 350;
        const totalX = 450;
        
        // Add table headers
        doc.fontSize(10)
           .text('Product', itemX, tableTop)
           .text('Description', descriptionX, tableTop)
           .text('Quantity', quantityX, tableTop)
           .text('Price', priceX, tableTop)
           .text('Total', totalX, tableTop);
        
        // Draw a line for the header
        doc.moveDown();
        const lineY = doc.y;
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(itemX, lineY).lineTo(550, lineY).stroke();
        doc.moveDown();
        
        // Add product rows
        let totalAmount = 0;
        let y = doc.y;
        
        // Add products to the table
        invoice.products.forEach(product => {
            const productTotal = product.price_when_buy * product.product_order_count;
            totalAmount += productTotal;
            
            // Check if we need a new page
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
            
            doc.fontSize(9)
               .text(product.name, itemX, y)
               .text(`${product.model} - ${product.serial_number}`, descriptionX, y)
               .text(product.product_order_count, quantityX, y)
               .text(`$${parseFloat(product.price_when_buy).toFixed(2)}`, priceX, y)
               .text(`$${productTotal.toFixed(2)}`, totalX, y);
            
            y += 20;
        });
        
        // Draw a line for the footer
        const footerLineY = y + 10;
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(itemX, footerLineY).lineTo(550, footerLineY).stroke();
        y = footerLineY + 20;
        
        // Add totals
        doc.fontSize(10);
        doc.text('Subtotal:', 350, y);
        doc.text(`$${totalAmount.toFixed(2)}`, totalX, y);
        y += 15;
        
        doc.text('Tax:', 350, y);
        doc.text(`$${parseFloat(invoice.order_tax_amount || 0).toFixed(2)}`, totalX, y);
        y += 15;
        
        doc.text('Shipping:', 350, y);
        doc.text(`$${parseFloat(invoice.order_shipping_price || 0).toFixed(2)}`, totalX, y);
        y += 15;
        
        const grandTotal = totalAmount + parseFloat(invoice.order_tax_amount || 0) + parseFloat(invoice.order_shipping_price || 0);
        doc.fontSize(12).text('TOTAL:', 350, y, { bold: true });
        doc.text(`$${grandTotal.toFixed(2)}`, totalX, y, { bold: true });
        
        // Add footer with terms
        doc.moveDown(4);
        doc.fontSize(10).text('Thank you for your business!', { align: 'center' });
        doc.fontSize(8).text('This is a computer-generated document. No signature is required.', { align: 'center' });
        
        // Finalize the PDF
        doc.end();
        
        // Wait for the PDF to be written to disk
        await new Promise((resolve, reject) => {
            pdfStream.on('finish', resolve);
            pdfStream.on('error', reject);
        });
        
        // Update the invoice with the PDF URL
        const pdfUrl = `/uploads/invoices/${pdfMetadata.fileName}`;
        await invoiceDb.updateInvoicePdfUrl(invoice.invoice_id, pdfUrl);
        
        // Return the PDF URL
        res.status(200).json({
            message: 'Invoice PDF generated successfully',
            pdfUrl,
            fileName: pdfMetadata.fileName
        });
    } catch (err) {
        console.error('Error generating invoice PDF:', err);
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.status(500).json({ error: 'Failed to generate invoice PDF', details: err.message });
    }
};

// ---- New for SCRUM-151: Generate and download batch PDF for multiple invoices ----
exports.generateBatchInvoicePdf = async (req, res) => {
    try {
        // Check authentication and authorization
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Sales Managers (role_id = 3) can generate batch invoice PDFs
        if (req.session.user.role_id !== 3) {
            return res.status(403).json({ error: 'Forbidden: Only Sales Managers can generate batch invoice PDFs' });
        }
        
        const { invoiceIds } = req.body;
        
        // Validate input
        if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return res.status(400).json({ error: 'At least one invoice ID is required' });
        }
        
        // Process each invoice
        const results = [];
        
        for (const invoiceId of invoiceIds) {
            try {
                // Get invoice data with PDF metadata
                const pdfMetadata = await invoiceDb.generateInvoicePdfMetadata(parseInt(invoiceId));
                const invoice = pdfMetadata.contentData;
                
                // Create PDF document
                const doc = new PDFDocument({ margin: 50 });
                
                // Ensure uploads directory exists
                const uploadDir = path.join(__dirname, '../../uploads/invoices');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                
                // Create a write stream for the PDF
                const pdfPath = path.join(uploadDir, pdfMetadata.fileName);
                const pdfStream = fs.createWriteStream(pdfPath);
                
                // Pipe PDF document to a file
                doc.pipe(pdfStream);
                
                // Set PDF metadata
                doc.info = {
                    Title: pdfMetadata.title,
                    Author: pdfMetadata.author,
                    Subject: pdfMetadata.subject,
                    Keywords: pdfMetadata.keywords,
                    CreationDate: pdfMetadata.creationDate,
                    ModDate: pdfMetadata.modificationDate,
                    Creator: pdfMetadata.creator,
                    Producer: pdfMetadata.producer
                };
                
                // Add company header
                doc.fontSize(20).text('Online Store', { align: 'center' });
                doc.fontSize(12).text('123 E-Commerce St, Internet City', { align: 'center' });
                doc.text('support@onlinestore.com | +1 (555) 123-4567', { align: 'center' });
                doc.moveDown(2);
                
                // Add invoice title and details
                doc.fontSize(16).text(`INVOICE #${invoice.invoice_id}`, { align: 'center' });
                doc.moveDown();
                
                // Add invoice info table
                doc.fontSize(10);
                doc.text(`Order ID: ${invoice.order_id}`);
                doc.text(`Invoice Date: ${new Date(invoice.generated_date).toLocaleDateString()}`);
                doc.text(`Status: ${getOrderStatusText(invoice.order_status)}`);
                doc.moveDown();
                
                // Add customer info
                doc.fontSize(12).text('Customer Information:', { underline: true });
                doc.fontSize(10);
                doc.text(`Name: ${invoice.username}`);
                doc.text(`Email: ${invoice.email}`);
                doc.text(`Shipping Address: ${formatAddress(invoice)}`);
                doc.moveDown();
                
                // Add product table header
                doc.fontSize(12).text('Ordered Products:', { underline: true });
                doc.moveDown(0.5);
                
                // Set up table layout
                const tableTop = doc.y;
                const itemX = 50;
                const descriptionX = 150;
                const quantityX = 280;
                const priceX = 350;
                const totalX = 450;
                
                // Add table headers
                doc.fontSize(10)
                   .text('Product', itemX, tableTop)
                   .text('Description', descriptionX, tableTop)
                   .text('Quantity', quantityX, tableTop)
                   .text('Price', priceX, tableTop)
                   .text('Total', totalX, tableTop);
                
                // Draw a line for the header
                doc.moveDown();
                const lineY = doc.y;
                doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(itemX, lineY).lineTo(550, lineY).stroke();
                doc.moveDown();
                
                // Add product rows
                let totalAmount = 0;
                let y = doc.y;
                
                // Add products to the table
                invoice.products.forEach(product => {
                    const productTotal = product.price_when_buy * product.product_order_count;
                    totalAmount += productTotal;
                    
                    // Check if we need a new page
                    if (y > 700) {
                        doc.addPage();
                        y = 50;
                    }
                    
                    doc.fontSize(9)
                       .text(product.name, itemX, y)
                       .text(`${product.model} - ${product.serial_number}`, descriptionX, y)
                       .text(product.product_order_count, quantityX, y)
                       .text(`$${parseFloat(product.price_when_buy).toFixed(2)}`, priceX, y)
                       .text(`$${productTotal.toFixed(2)}`, totalX, y);
                    
                    y += 20;
                });
                
                // Draw a line for the footer
                const footerLineY = y + 10;
                doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(itemX, footerLineY).lineTo(550, footerLineY).stroke();
                y = footerLineY + 20;
                
                // Add totals
                doc.fontSize(10);
                doc.text('Subtotal:', 350, y);
                doc.text(`$${totalAmount.toFixed(2)}`, totalX, y);
                y += 15;
                
                doc.text('Tax:', 350, y);
                doc.text(`$${parseFloat(invoice.order_tax_amount || 0).toFixed(2)}`, totalX, y);
                y += 15;
                
                doc.text('Shipping:', 350, y);
                doc.text(`$${parseFloat(invoice.order_shipping_price || 0).toFixed(2)}`, totalX, y);
                y += 15;
                
                const grandTotal = totalAmount + parseFloat(invoice.order_tax_amount || 0) + parseFloat(invoice.order_shipping_price || 0);
                doc.fontSize(12).text('TOTAL:', 350, y, { bold: true });
                doc.text(`$${grandTotal.toFixed(2)}`, totalX, y, { bold: true });
                
                // Add footer with terms
                doc.moveDown(4);
                doc.fontSize(10).text('Thank you for your business!', { align: 'center' });
                doc.fontSize(8).text('This is a computer-generated document. No signature is required.', { align: 'center' });
                
                // Finalize the PDF
                doc.end();
                
                // Wait for the PDF to be written to disk
                await new Promise((resolve, reject) => {
                    pdfStream.on('finish', resolve);
                    pdfStream.on('error', reject);
                });
                
                // Update the invoice with the PDF URL
                const pdfUrl = `/uploads/invoices/${pdfMetadata.fileName}`;
                await invoiceDb.updateInvoicePdfUrl(invoice.invoice_id, pdfUrl);
                
                // Add result
                results.push({
                    invoiceId: invoice.invoice_id,
                    success: true,
                    pdfUrl,
                    fileName: pdfMetadata.fileName
                });
            } catch (err) {
                // Log the error and continue with other invoices
                console.error(`Error processing invoice ${invoiceId}:`, err);
                results.push({
                    invoiceId,
                    success: false,
                    error: err.message
                });
            }
        }
        
        // Return results
        res.status(200).json({
            message: 'Batch invoice PDF generation completed',
            results,
            successCount: results.filter(r => r.success).length,
            failureCount: results.filter(r => !r.success).length
        });
    } catch (err) {
        console.error('Error generating batch invoice PDFs:', err);
        res.status(500).json({ error: 'Failed to generate batch invoice PDFs', details: err.message });
    }
};

// Helper functions
function getOrderStatusText(statusCode) {
    const statuses = {
        0: 'Processing',
        1: 'In Transit',
        2: 'Delivered',
        3: 'Completed',
        4: 'Cancelled',
        5: 'Refunded'
    };
    return statuses[statusCode] || 'Unknown';
}

function formatAddress(invoice) {
    if (!invoice.address_street) return 'Not provided';
    
    return [
        invoice.address_street,
        invoice.address_city,
        invoice.address_state,
        invoice.address_zip,
        invoice.address_country
    ].filter(Boolean).join(', ');
}

