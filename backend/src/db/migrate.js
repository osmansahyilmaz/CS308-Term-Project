const pool = require('./pool');
const createAllTables = require('./migrations/init_tables');

const runMigrations = async () => {
    try {
        await createAllTables();
        console.log('✅ All migrations executed successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);  // Exit process on migration failure
    }
};

// 🔹 Export without closing `pool`
module.exports = runMigrations;

