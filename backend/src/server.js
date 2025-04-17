require('dotenv').config();
// console.log("EMAIL_USER:", process.env.EMAIL_USER);

const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db/pool');

const invoiceRoutes = require('./routes/invoiceRoutes');
const authRoutes = require('./routes/authRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const productsRoutes = require('./routes/productsRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const addressRoutes = require('./routes/addressRoutes');
const cartRoutes = require('./routes/cartRoutes');

const runMigrations = require('./db/migrate');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL || "http://localhost:3000" }));

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
        maxAge: 1000 * 60 * 60 * 24,
        secure: false,
        httpOnly: true
    }
}));

// Routes
app.use('/api', invoiceRoutes);
app.use('/api', authRoutes);
app.use('/api', commentsRoutes);
app.use('/api', cartRoutes);
app.use('/api', productsRoutes);
app.use('/api', reviewsRoutes);
app.use('/api', ordersRoutes);
app.use('/api', addressRoutes);

module.exports = app;

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
