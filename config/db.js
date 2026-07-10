const { Pool } = require('pg');
require('dotenv').config();

let pgPool;

if (process.env.DB_URL) {
  pgPool = new Pool({
    connectionString: process.env.DB_URL,
  });
} else {
  pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'immunitrack_immunisation',
    port: Number(process.env.DB_PORT || 5432),
  });
}

const formatQueryResponse = (res) => {
  if (res.command === 'SELECT') {
    return [res.rows, res];
  } else {
    // For INSERT, UPDATE, DELETE, create a mysql2-compatible ResultSetHeader
    const resultHeader = {
      affectedRows: res.rowCount,
      insertId: res.rows && res.rows[0] && res.rows[0].id ? res.rows[0].id : null,
    };
    return [resultHeader, res];
  }
};

const db = {
  query: async (text, params) => {
    const res = await pgPool.query(text, params);
    return formatQueryResponse(res);
  },
  getConnection: async () => {
    const client = await pgPool.connect();
    return {
      query: async (text, params) => {
        const res = await client.query(text, params);
        return formatQueryResponse(res);
      },
      beginTransaction: async () => {
        await client.query('BEGIN');
      },
      commit: async () => {
        await client.query('COMMIT');
      },
      rollback: async () => {
        await client.query('ROLLBACK');
      },
      release: () => {
        client.release();
      }
    };
  },
  end: () => pgPool.end()
};

module.exports = db;
