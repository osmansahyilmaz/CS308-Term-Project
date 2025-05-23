const pool = require('../../src/db/pool');

async function cleanTestData() {
    try {
        // Delete test data in reverse order of dependencies
        await pool.query('DELETE FROM reviews WHERE title = $1', ['Test Review']);
        await pool.query('DELETE FROM products_of_order WHERE product_id IN (SELECT product_id FROM products WHERE name LIKE $1)', ['Test Product%']);
        await pool.query('DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
        await pool.query('DELETE FROM cart WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
        await pool.query('DELETE FROM products WHERE name LIKE $1', ['Test Product%']);
        await pool.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
        
        // Note: We don't delete test categories as they might be used by real products

        console.log('✅ Test data cleanup completed');
    } catch (error) {
        console.error('❌ Error cleaning test data:', error);
        throw error;
    }
}

module.exports = cleanTestData;
