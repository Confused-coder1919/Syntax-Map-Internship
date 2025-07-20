const { Pool, Client } = require('pg')
require('dotenv').config();

const connectionString = process.env.DATABASE_URL

const pool = new Pool({
  connectionString
})

module.exports = pool;
