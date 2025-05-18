const nodemailer = require('nodemailer');
const pool = require('../db/pool');
const invoiceDb = require('../db/invoices');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate invoice PDF and save it to the filesystem
// This function can be called internally (not an API endpoint)
const generateInvoicePdf = async (invoiceId, orderId, userId) => {
    try {
        console.log(`📄 Automatically generating PDF for invoice ${invoiceId}, order ${orderId}`);
        
        // First get the invoice description from the database
        const invoiceResult = await pool.query(
            'SELECT invoice_description FROM invoices WHERE invoice_id = $1', 
            [invoiceId]
        );
        
        if (invoiceResult.rows.length === 0) {
            console.error(`❌ Invoice with ID ${invoiceId} not found in database`);
            return {
                success: false,
                error: 'Invoice not found in database'
            };
        }
        
        // Get the invoice number from database, this ensures consistency
        let invoiceNumber = invoiceResult.rows[0].invoice_description;
        
        if (!invoiceNumber) {
            // If somehow invoice_description is not set, create one and update the database
            const timestamp = Date.now();
            invoiceNumber = `INV-${timestamp}`;
            
            // Update database with this invoice number
            await pool.query(
                'UPDATE invoices SET invoice_description = $1 WHERE invoice_id = $2',
                [invoiceNumber, invoiceId]
            );
            console.log(`📝 Generated new invoice number: ${invoiceNumber}`);
        } else {
            console.log(`📝 Using existing invoice number: ${invoiceNumber}`);
        }
        
        // Get order details
        const orderQuery = `
            SELECT 
                o.order_id, 
                o.order_date, 
                o.order_total_price,
                u.username,
                u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.order_id = $1 AND o.user_id = $2
        `;
        const orderResult = await pool.query(orderQuery, [orderId, userId]);
        
        if (orderResult.rows.length === 0) {
            console.error(`❌ Order ${orderId} not found for user ${userId}`);
            return {
                success: false,
                error: `Order ${orderId} not found for user ${userId}`
            };
        }
        
        const order = orderResult.rows[0];
        
        // Get order items
        const orderItemsQuery = `
            SELECT 
                po.product_id, 
                CAST(po.price_when_buy AS numeric) as price_when_buy, 
                po.product_order_count,
                p.name as product_name
            FROM products_of_order po
            JOIN products p ON po.product_id = p.product_id
            WHERE po.order_id = $1
        `;
        const itemsResult = await pool.query(orderItemsQuery, [orderId]);
        
        // Create PDF document
        const doc = new PDFDocument();
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../../uploads');
        const invoicesDir = path.join(uploadsDir, 'invoices');
        
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }
        
        // Generate standardized filename
        const filename = `invoice-${invoiceNumber}.pdf`;
        const filepath = path.join(invoicesDir, filename);
        
        // Create write stream
        const writeStream = fs.createWriteStream(filepath);
        
        // Pipe the PDF document to the file
        doc.pipe(writeStream);
        
        // Add content to PDF
        doc.fontSize(25).text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Invoice #: ${invoiceNumber}`);
        doc.fontSize(14).text(`Date: ${new Date(order.order_date).toLocaleDateString()}`);
        doc.fontSize(14).text(`Customer: ${order.username}`);
        doc.fontSize(14).text(`Email: ${order.email}`);
        doc.moveDown();
        
        // Create table header
        doc.fontSize(12);
        const tableTop = doc.y + 20;
        const itemX = 50;
        const qtyX = 300;
        const priceX = 350;
        const totalX = 450;
        
        doc.text('Item', itemX, tableTop);
        doc.text('Qty', qtyX, tableTop);
        doc.text('Price', priceX, tableTop);
        doc.text('Total', totalX, tableTop);
        
        // Add horizontal line
        doc.moveTo(itemX, tableTop + 20)
           .lineTo(totalX + 50, tableTop + 20)
           .stroke();
        
        // Add items
        let y = tableTop + 40;
        let totalAmount = 0;
        
        for (const item of itemsResult.rows) {
            const itemTotal = parseFloat(item.price_when_buy) * item.product_order_count;
            totalAmount += itemTotal;
            
            doc.text(item.product_name, itemX, y);
            doc.text(item.product_order_count.toString(), qtyX, y);
            doc.text(`$${parseFloat(item.price_when_buy).toFixed(2)}`, priceX, y);
            doc.text(`$${itemTotal.toFixed(2)}`, totalX, y);
            y += 20;
        }
        
        // Add horizontal line
        doc.moveTo(itemX, y)
           .lineTo(totalX + 50, y)
           .stroke();
        
        // Add total
        doc.fontSize(14).text(`Grand Total: $${totalAmount.toFixed(2)}`, totalX - 50, y + 20);
        
        // Finalize PDF
        doc.end();
        
        // Return a promise that resolves when the PDF is fully written
        return new Promise((resolve, reject) => {
            writeStream.on('finish', async () => {
                try {
                    // Verify the file was created properly
                    if (fs.existsSync(filepath)) {
                        const stats = fs.statSync(filepath);
                        console.log(`✅ Invoice PDF generated successfully: ${filepath}, size: ${stats.size} bytes`);
                        
                        if (stats.size < 100) {
                            console.error(`⚠️ Warning: PDF file is suspiciously small (${stats.size} bytes)`);
                            reject(new Error('Generated PDF is too small, likely corrupted'));
                            return;
                        }
                        
                        // Create a relative URL path for the database
                        const relativeUrl = `/uploads/invoices/${filename}`;
                        
                        // Update the database with the file URL
                        await pool.query(
                            'UPDATE invoices SET invoice_pdf_url = $1 WHERE invoice_id = $2',
                            [relativeUrl, invoiceId]
                        );
                        
                        resolve({
                            success: true,
                            url: relativeUrl,
                            invoiceNumber
                        });
                    } else {
                        reject(new Error('Failed to save PDF file'));
                    }
                } catch (err) {
                    console.error('Error saving generated PDF:', err);
                    reject(err);
                }
            });
            
            writeStream.on('error', (err) => {
                console.error('Error writing PDF:', err);
                reject(err);
            });
        });
    } catch (err) {
        console.error('Error in generateInvoicePdf:', err);
        return {
            success: false,
            error: err.message
        };
    }
};

const sendInvoiceEmail = async (req, res) => {
    const { to, invoiceNumber } = req.body;

    console.log("📩 Received email request:", { to, invoiceNumber }); 

    if (!to || !invoiceNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Get invoice details from database
        const invoiceResult = await pool.query(
            'SELECT invoice_pdf_url FROM invoices WHERE invoice_description = $1',
            [invoiceNumber]
        );

        if (invoiceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const pdfUrl = invoiceResult.rows[0].invoice_pdf_url;
        if (!pdfUrl) {
            return res.status(404).json({ error: 'PDF not found for this invoice' });
        }

        // Get the full path to the PDF file
        const pdfPath = path.join(__dirname, '../../', pdfUrl);
        console.log("📄 PDF path:", pdfPath);
        
        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({ error: 'PDF file not found on server' });
        }

        // Read the PDF file
        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfBase64 = pdfBuffer.toString('base64');

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587, 
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        let mailOptions = {
            from: process.env.EMAIL_FROM || '"Online Store" <no-reply@example.com>',
            to,
            subject: `Invoice #${invoiceNumber}`,
            text: `Please find attached your invoice #${invoiceNumber}.`,
            attachments: [{
                filename: `invoice-${invoiceNumber}.pdf`,
                content: pdfBuffer
            }]
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info.response);
        res.status(200).json({ message: 'Invoice emailed successfully', info });
    } catch (err) {
        console.error("❌ Error sending email:", err);
        res.status(500).json({ error: 'Error sending email', details: err.message });
    }
};


// Save invoice PDF to the invoices table
const saveInvoicePdf = async (req, res) => {
    const { invoiceId, pdfData } = req.body;
    
    if (!invoiceId || !pdfData) {
        return res.status(400).json({ error: 'invoiceId and pdfData are required' });
    }
    
    try {
        console.log(`💾 Saving PDF for invoice ${invoiceId}`);
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../../uploads');
        const invoicesDir = path.join(uploadsDir, 'invoices');
        
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir);
        }
        
        // Get invoice info from database
        const invoiceResult = await pool.query(
            'SELECT invoice_description FROM invoices WHERE invoice_id = $1', 
            [invoiceId]
        );
        
        let invoiceNumber;
        
        // Use invoice number from database if available
        if (invoiceResult.rows.length > 0 && invoiceResult.rows[0].invoice_description) {
            invoiceNumber = invoiceResult.rows[0].invoice_description;
        } else {
            // Generate a new invoice number
            const timestamp = Date.now();
            invoiceNumber = `INV-${timestamp}`;
            
            // Update database with new invoice number
            await pool.query(
                'UPDATE invoices SET invoice_description = $1 WHERE invoice_id = $2',
                [invoiceNumber, invoiceId]
            );
        }
        
        console.log(`📝 Using invoice number: ${invoiceNumber}`);
        
        // Generate filename
        const filename = `invoice-${invoiceNumber}.pdf`;
        const filepath = path.join(invoicesDir, filename);
        
        console.log(`📝 Writing PDF to: ${filepath}`);
        
        // Extract the base64 data properly
        let base64Data;
        if (pdfData.includes('base64,')) {
            base64Data = pdfData.split('base64,')[1];
        } else {
            base64Data = pdfData;
        }
        
        // Create buffer from base64 data
        const pdfBuffer = Buffer.from(base64Data, 'base64');
        
        // Write buffer to file
        fs.writeFileSync(filepath, pdfBuffer);
        
        // Check if file was written successfully
        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            console.log(`✅ PDF saved successfully: ${filepath}, size: ${stats.size} bytes`);
            
            if (stats.size < 100) {
                console.error(`⚠️ Warning: PDF file is suspiciously small (${stats.size} bytes)`);
            }
        } else {
            return res.status(500).json({ error: 'Failed to save PDF file' });
        }
        
        // Save URL to database
        const relativeUrl = `/uploads/invoices/${filename}`;
        
        await pool.query(
            'UPDATE invoices SET invoice_pdf_url = $1 WHERE invoice_id = $2',
            [relativeUrl, invoiceId]
        );
        
        // Success response
        res.json({ 
            message: 'Invoice PDF saved successfully',
            url: relativeUrl,
            invoiceNumber: invoiceNumber
        });
        
    } catch (err) {
        console.error('❌ Error saving invoice PDF:', err);
        res.status(500).json({ error: 'Failed to save invoice PDF', details: err.message });
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

// Get all invoices (for Sales Managers)
const getAllInvoices = async (req, res) => {
    // Check if user is authenticated and has Sales Manager role
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Assume role_id 3 is for Sales Managers (adjust as needed for your schema)
    if (req.session.user.role_id !== 3 && req.session.user.role_id !== 1) {
        return res.status(403).json({ error: 'Access denied. Only Sales Managers can view all invoices.' });
    }
    
    try {
        const result = await pool.query(`
            SELECT 
                i.invoice_id,
                i.order_id,
                i.user_id,
                i.generated_date,
                i.invoice_description,
                i.invoice_pdf_url,
                u.username,
                u.email,
                o.order_total_price,
                o.order_status
            FROM 
                invoices i
            JOIN 
                users u ON i.user_id = u.id
            JOIN 
                orders o ON i.order_id = o.order_id
            ORDER BY 
                i.generated_date DESC
        `);
        
        res.json({
            count: result.rows.length,
            invoices: result.rows
        });
    } catch (err) {
        console.error('Error fetching all invoices:', err);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

// Get a specific invoice by ID (for Sales Managers or the invoice owner)
const getInvoiceById = async (req, res) => {
    const { invoiceId } = req.params;
    
    // Check if user is authenticated
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const result = await pool.query(
            'SELECT * FROM invoices WHERE invoice_id = $1',
            [invoiceId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        
        const invoice = result.rows[0];
        
        // Check if user is authorized (either the owner or a Sales Manager)
        if (invoice.user_id !== req.session.user.id && 
            req.session.user.role_id !== 3 && 
            req.session.user.role_id !== 1) {
            return res.status(403).json({ error: 'Access denied. You can only view your own invoices.' });
        }
        
        res.json(invoice);
    } catch (err) {
        console.error('Error fetching invoice by ID:', err);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
};

module.exports = {
    sendInvoiceEmail,
    saveInvoicePdf,
    getInvoiceByOrderId,
    generateInvoicePdf,
    getAllInvoices,
    getInvoiceById
};

