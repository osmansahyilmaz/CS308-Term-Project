require('dotenv').config();
const pool = require('../pool');

const updateProductsOfOrderTable = async () => {
    const query = `
    ALTER TABLE products_of_order 
    ALTER COLUMN discount_when_buy SET DEFAULT 0;
    `;
    
    try {
        await pool.query(query);
        console.log('✅ ProductsOfOrder table updated with default discount value.');
    } catch (err) {
        console.error('❌ Error updating products_of_order table:', err);
    }
};

// Run the update if this file is executed directly
if (require.main === module) {
    updateProductsOfOrderTable()
        .then(() => {
            console.log('Migration completed successfully.');
            process.exit(0);
        })
        .catch(err => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

module.exports = updateProductsOfOrderTable; 