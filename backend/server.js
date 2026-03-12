const express = require('express');
const cors = require('cors');
const helmet = require('helmet')
const database = require('./config/database');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const gearRoutes = require('./routes/gear');
const bagRoutes = require('./routes/bags');
const tripRoutes = require('./routes/trips');
const waitlistRoutes = require('./routes/waitlist');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Too many attempts, please try again later' }
});

const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 signups per hour per IP
  message: { error: 'Too many signup attempts, please try again later' }
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    'http://ultralite.app',
    'https://ultralite.app',
    'https://www.ultralite.app',
    /^https:\/\/ultralite.*\.vercel\.app$/,
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());

// Apply rate limiters BEFORE mounting routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/waitlist', waitlistLimiter);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/gear', gearRoutes);
app.use('/api/bags', bagRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/waitlist', waitlistRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

(async () => {
  await database.initPool();
  app.listen(PORT, () => {
    console.log(`UltraLite API running on http://localhost:${PORT}`);
  });
})();
