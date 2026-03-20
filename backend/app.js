const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

const authRoutes     = require('./routes/authroutes');
const categoryRoutes = require('./routes/categoryroutes');
const menuRoutes     = require('./routes/menuroutes');
const tableRoutes    = require('./routes/tableroutes');
const orderRoutes    = require('./routes/orderroutes');
const reportRoutes   = require('./routes/reportroutes');

app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu',       menuRoutes);
app.use('/api/tables',     tableRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/reports',    reportRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Restaurant API is running!' });
});

module.exports = app;
