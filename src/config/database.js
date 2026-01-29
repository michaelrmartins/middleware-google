const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Listener for unexpected errors on idle clients
pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente do banco', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};