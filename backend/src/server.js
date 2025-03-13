const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db/pool');
const authRoutes = require('./routes/authRoutes');
const runMigrations = require('./db/migrate');  // ✅ Import migrate.js
const cors = require('cors'); // ✅ Import CORS (if needed)

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL || "http://localhost:3000" }));

// 🔹 Session Configuration
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true // ✅ Ensures session table exists
    }),
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: false, // ❗ Set `false` for local dev, `true` for production
        httpOnly: true
    }
}));

// 🔹 Routes
app.use('/auth', authRoutes);

// ✅ Export app for testing (IMPORTANT!)
module.exports = app;

// 🔹 If running directly (not imported by tests), start server
if (require.main === module) {
    const startServer = async () => {
        try {
            await runMigrations(); // ✅ Run migrations
            console.log("✅ Database migrations completed");

            const PORT = process.env.PORT || 5000;
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });

        } catch (err) {
            console.error("❌ Failed to start server:", err);
            process.exit(1);
        }
    };

    startServer();
}
