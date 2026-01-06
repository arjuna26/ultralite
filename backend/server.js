const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const gearRoutes = require('./routes/gear');
const bagRoutes = require('./routes/bags');
const tripRoutes = require('./routes/trips');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/gear', gearRoutes);
app.use('/api/bags', bagRoutes);
app.use('/api/trips', tripRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`UltraLite API running on http://localhost:${PORT}`);
});
