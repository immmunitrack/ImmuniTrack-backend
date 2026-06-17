const mysql = require('mysql2/promise');
require('dotenv').config();

// A connection pool keeps several database connections ready for reuse.
// That is more efficient than opening and closing a new connection for every API request.
const pool = mysql.createPool({
  // Values come from .env so the code works on different machines without editing source files.
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jobconnect',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Controllers import this pool whenever they need to query MariaDB/MySQL.
module.exports = pool;
