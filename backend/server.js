import express, { json } from 'express';
import cors from 'cors';
require('dotenv').config();

import authRoutes from './routes/auth';
import gearRoutes from './routes/gear';
import bagRoutes from './routes/bags';
import tripRoutes from './routes/trips';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(json());

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
