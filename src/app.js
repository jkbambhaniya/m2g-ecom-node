require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const authRoutes = require('./routes/auth');
const guestRoutes = require('./routes/guestRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// User authentication routes
app.use('/api/auth', authRoutes);

// Guest routes (products, categories, settings - read-only)
app.use('/api', guestRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

// Admin routes (login, protected operations)
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.json({ msg: 'M2G Ecom API' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

module.exports = app;
