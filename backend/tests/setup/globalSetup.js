const pool = require('../../src/db/pool');
const runMigrations = require('../../src/db/migrate');

module.exports = async () => {
    try {
        // Run migrations to ensure database schema is up to date
        await runMigrations();
        
        // Seed test data
        await require('../helpers/seedTestData')();
        
        console.log('✅ Test environment setup complete');
    } catch (error) {
        console.error('❌ Error setting up test environment:', error);
        throw error;
    }
};
