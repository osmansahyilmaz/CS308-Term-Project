require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db/pool');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const cartRoutes = require('./routes/cartRoutes');
const productsRoutes = require('./routes/productsRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const addressRoutes = require('./routes/addressRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

const runMigrations = require('./db/migrate');

const app = express();

app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));

app.use(session({
  store: new pgSession({ pool, tableName: 'session', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 86400000, secure: false, httpOnly: true }
}));

app.use('/api', authRoutes);
app.use('/api', commentsRoutes);
app.use('/api', cartRoutes);
app.use('/api', productsRoutes);
app.use('/api', reviewsRoutes);
app.use('/api', ordersRoutes);
app.use('/api', addressRoutes);
app.use('/api', invoiceRoutes);

module.exports = app;

if (require.main === module) {
  (async () => {
    await runMigrations();
    console.log('✅ Migrations done');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
  })();
}
