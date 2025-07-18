const pool = require('./pool');

/**
 * Get invoices within a date range
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of invoice objects
 */
const getInvoicesByDateRange = async (startDate, endDate) => {
    // Convert dates to timestamps with time components for inclusive range
    const startDateTimestamp = `${startDate} 00:00:00`;
    const endDateTimestamp = `${endDate} 23:59:59`;

    const query = `
        SELECT
            i.invoice_id,
            i.order_id,
            i.user_id,
            u.username,
            u.email,
            i.generated_date,
            i.invoice_description,
            i.invoice_pdf_url,
            o.order_total_price,
            o.order_status
        FROM invoices i
        JOIN users u ON i.user_id = u.id
        JOIN orders o ON i.order_id = o.order_id
        WHERE i.generated_date BETWEEN $1 AND $2
        ORDER BY i.generated_date DESC
    `;

    try {
        const result = await pool.query(query, [startDateTimestamp, endDateTimestamp]);
        return result.rows;
    } catch (err) {
        throw new Error('Error fetching invoices by date range: ' + err.message);
    }
};

/**
 * Get invoice details by id
 * @param {number} invoiceId - The invoice ID
 * @returns {Promise<Object>} - Invoice object with related order and product details
 */
const getInvoiceById = async (invoiceId) => {
    const query = `
        SELECT
            i.invoice_id,
            i.order_id,
            i.user_id,
            u.username,
            u.email,
            i.generated_date,
            i.invoice_description,
            i.invoice_pdf_url,
            o.order_total_price,
            o.order_tax_amount,
            o.order_status,
            o.order_shipping_price,
            a.address_street,
            a.address_city,
            a.address_state,
            a.address_zip,
            a.address_country
        FROM invoices i
        JOIN users u ON i.user_id = u.id
        JOIN orders o ON i.order_id = o.order_id
        LEFT JOIN addresses a ON o.order_shipping_address = a.address_id
        WHERE i.invoice_id = $1
    `;

    try {
        const result = await pool.query(query, [invoiceId]);
        
        if (result.rows.length === 0) {
            throw new Error(`Invoice with ID ${invoiceId} not found`);
        }
        
        const invoice = result.rows[0];
        
        // Get order products
        const productsQuery = `
            SELECT
                p.product_id,
                p.name,
                p.model,
                p.serial_number,
                po.price_when_buy,
                po.tax_when_buy,
                po.discount_when_buy,
                po.product_order_count
            FROM products_of_order po
            JOIN products p ON po.product_id = p.product_id
            WHERE po.order_id = $1
        `;
        
        const productsResult = await pool.query(productsQuery, [invoice.order_id]);
        invoice.products = productsResult.rows;
        
        return invoice;
    } catch (err) {
        throw new Error('Error fetching invoice details: ' + err.message);
    }
};

/**
 * Generate PDF metadata for invoice
 * @param {number} invoiceId - The invoice ID
 * @returns {Promise<Object>} - Updated invoice object with PDF metadata
 */
const generateInvoicePdfMetadata = async (invoiceId) => {
    // First get the invoice data
    const invoice = await getInvoiceById(invoiceId);
    
    if (!invoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
    }
    
    // Generate PDF metadata
    const pdfMetadata = {
        fileName: `invoice_${invoiceId}_${Date.now()}.pdf`,
        title: `Invoice #${invoiceId}`,
        author: 'Online Store',
        subject: `Invoice for Order #${invoice.order_id}`,
        keywords: 'invoice, order, online store',
        creationDate: new Date(),
        modificationDate: new Date(),
        creator: 'PDF Generator Service',
        producer: 'Online Store E-Commerce Platform',
        contentData: invoice
    };
    
    return pdfMetadata;
};

/**
 * Update invoice with PDF URL
 * @param {number} invoiceId - The invoice ID
 * @param {string} pdfUrl - The URL to the generated PDF
 * @returns {Promise<Object>} - Updated invoice object
 */
const updateInvoicePdfUrl = async (invoiceId, pdfUrl) => {
    const updateQuery = `
        UPDATE invoices
        SET invoice_pdf_url = $1
        WHERE invoice_id = $2
        RETURNING invoice_id, invoice_pdf_url
    `;
    
    try {
        const result = await pool.query(updateQuery, [pdfUrl, invoiceId]);
        
        if (result.rows.length === 0) {
            throw new Error(`Failed to update invoice ${invoiceId} with PDF URL`);
        }
        
        return result.rows[0];
    } catch (err) {
        throw new Error('Error updating invoice PDF URL: ' + err.message);
    }
};

module.exports = {
    getInvoicesByDateRange,
    getInvoiceById,
    generateInvoicePdfMetadata,
    updateInvoicePdfUrl
}; 