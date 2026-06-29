const { Pool, types } = require("pg");
require("dotenv").config();

// Return DATE/TIMESTAMP columns as plain strings (YYYY-MM-DD), not JS Date objects
types.setTypeParser(1082, val => val);   // DATE
types.setTypeParser(1114, val => val);   // TIMESTAMP
types.setTypeParser(1184, val => val);   // TIMESTAMPTZ

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || "dhpl_db",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",
});

pool.on("error", (err) => console.error("PostgreSQL error", err));

module.exports = pool;
