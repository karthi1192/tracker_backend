const { Pool, types } = require("pg");
require("dotenv").config();

// Return DATE/TIMESTAMP columns as plain strings (YYYY-MM-DD), not JS Date objects
types.setTypeParser(1082, val => val);   // DATE
types.setTypeParser(1114, val => val);   // TIMESTAMP
types.setTypeParser(1184, val => val);   // TIMESTAMPTZ

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("error", (err) => console.error("PostgreSQL error", err));

module.exports = pool;
