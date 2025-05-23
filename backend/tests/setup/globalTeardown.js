const pool = require('../../src/db/pool');

module.exports = async () => {
    try {
        // Clean up test data
        await require('../helpers/cleanTestData')();
        
        // Close database connection
        await pool.end();
        
        console.log('✅ Test environment cleanup complete');
    } catch (error) {
        console.error('❌ Error cleaning up test environment:', error);
        throw error;
    }
};
