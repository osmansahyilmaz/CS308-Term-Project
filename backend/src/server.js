const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db/pool');
const authRoutes = require('./routes/authRoutes');
const runMigrations = require('./db/migrate');  // ✅ Import migrate.js
const cors = require('cors'); // ✅ Import CORS (if needed)

const app = express();

// ✅ Middleware
app.use(express.json()); // Middleware for JSON parsing
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL || "http://localhost:3000" })); // Allow frontend connections 3000 is for for reactjs

// 🔹 Run migrations before starting the server
const startServer = async () => {
    try {
        await runMigrations();  // ✅ Runs migrations on startup
        console.log("✅ Database migrations completed");

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
                maxAge: 1000 * 60 * 60 * 24,  // 1 day
                secure: true,
                httpOnly: true
            }
        }));

        // 🔹 Routes
        app.use('/auth', authRoutes);

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1); // Exit if migrations fail
    }
};

startServer();
