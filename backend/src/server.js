const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db/pool');
const authRoutes = require('./routes/authRoutes');
const commentsRoutes = require('./routes/commentsRoutes'); // <-- NEW
const productsRoutes = require('./routes/productsRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes'); // Import reviewsRoutes
const ordersRoutes = require('./routes/ordersRoutes'); // Import ordersRoutes
const addressRoutes = require('./routes/addressRoutes'); // Import addressRoutes

const runMigrations = require('./db/migrate');  // ✅ Import migrate.js
const cors = require('cors'); // ✅ Import CORS (if needed)
const cartRoutes = require('./routes/cartRoutes'); // Import cartRoutes

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL || "http://localhost:3000" }));

// Session Configuration
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: false,
        httpOnly: true
    }
}));

// Routes
app.use('/api', authRoutes);
app.use('/api', commentsRoutes); // <-- NEW
app.use('/api', cartRoutes); // Add cart routes
app.use('/api', productsRoutes);
app.use('/api', reviewsRoutes); // Add reviews routes
app.use('/api', ordersRoutes); // Ensure orders routes are included
app.use('/api', addressRoutes); // Add address routes

// Export app for testing
module.exports = app;

// If running directly, start server
if (require.main === module) {
    const startServer = async () => {
        try {
            await runMigrations();
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
