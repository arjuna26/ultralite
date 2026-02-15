const { Pool } = require('pg');
const dns = require('dns').promises;

let _pool = null;

async function initPool() {
  if (_pool) return _pool;

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME || 'ultralite';
  const password = process.env.DB_PASSWORD || 'postgres';

  const connectHost =
    host === 'localhost' || host === '127.0.0.1'
      ? host
      : (await dns.lookup(host, { family: 4 })).address;

  _pool = new Pool({
    user,
    host: connectHost,
    database,
    password,
    port,
  });

  try {
    const res = await _pool.query('SELECT NOW()');
    console.log('database connected:', res.rows[0].now);
  } catch (err) {
    console.error('database connection failed:', err);
    _pool = null;
    process.exit(1);
  }

  return _pool;
}

const proxy = {
  query(...args) {
    if (!_pool) throw new Error('Database not initialized; call initPool() first');
    return _pool.query(...args);
  },
  connect(...args) {
    if (!_pool) throw new Error('Database not initialized; call initPool() first');
    return _pool.connect(...args);
  },
};

module.exports = proxy;
module.exports.initPool = initPool;