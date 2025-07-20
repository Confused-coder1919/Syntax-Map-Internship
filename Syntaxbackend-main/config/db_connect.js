const { Pool, Client } = require('pg')
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Set default database connection values for local development
const DEFAULT_DB_HOST = 'localhost';
const DEFAULT_DB_PORT = '5432';
const DEFAULT_DB_NAME = 'mapdb';
const DEFAULT_DB_USER = 'postgres';
const DEFAULT_DB_PASSWORD = '';

// Log connection information for debugging
console.log('Database connection attempt...');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');

// Determine if we're in the Render environment
const isRenderEnvironment = process.env.RENDER === 'true' || 
                           process.env.IS_RENDER === 'true' || 
                           process.env.RENDER_EXTERNAL_URL !== undefined;

console.log('Running in Render environment:', isRenderEnvironment ? 'Yes' : 'No');

// Utility function to ensure connection string has the full domain
function ensureFullDomain(connectionString) {
  if (!connectionString) return connectionString;
  
  // Check if this is a Render Postgres URL with an incomplete domain
  if (connectionString.includes('@dpg-') && !connectionString.includes('.render.com')) {
    // Look for the pattern @dpg-XXXXX-a/ and replace with the full domain
    const regex = /(@dpg-[a-z0-9]+-a)(\/*)/;
    return connectionString.replace(regex, '$1.oregon-postgres.render.com$2');
  }
  
  return connectionString;
}

// Get database configuration based on environment
let dbConfig;

// Prioritize connection using EXTERNAL_DATABASE_URL if available (for Render)
if (process.env.EXTERNAL_DATABASE_URL && isRenderEnvironment) {
  console.log('Using EXTERNAL_DATABASE_URL for connection (Render)');
  dbConfig = {
    connectionString: ensureFullDomain(process.env.EXTERNAL_DATABASE_URL),
    ssl: { rejectUnauthorized: false }
  };
}
// CASE 1: If DATABASE_URL is provided (typical for Render and other cloud platforms)
else if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL for connection');
  dbConfig = {
    connectionString: ensureFullDomain(process.env.DATABASE_URL),
    ssl: process.env.PGSSLMODE === 'no-verify' ? { rejectUnauthorized: false } : undefined
  };
}
// CASE 2: If individual environment variables are provided
else if (process.env.DB_HOST && process.env.DB_NAME) {
  console.log('Using individual environment variables for database connection');
  // Ensure host includes the full domain if it's a Render Postgres instance
  let host = process.env.DB_HOST;
  if (host.startsWith('dpg-') && !host.includes('.render.com')) {
    host = `${host}.oregon-postgres.render.com`;
    console.log('Fixed host to include full domain:', host);
  }
  
  dbConfig = {
    host: host,
    port: process.env.DB_PORT || DEFAULT_DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.PGSSLMODE === 'no-verify' ? { rejectUnauthorized: false } : undefined
  };
}
// CASE 3: Default local development configuration
else {
  console.log('Using default local database configuration');
  dbConfig = {
    host: DEFAULT_DB_HOST,
    port: DEFAULT_DB_PORT,
    database: DEFAULT_DB_NAME,
    user: DEFAULT_DB_USER,
    password: DEFAULT_DB_PASSWORD
  };
}

// Log connection details (without sensitive information)
console.log('Database config:', {
  host: dbConfig.connectionString ? 'Using connection string' : (dbConfig.host || 'Not set'),
  database: dbConfig.connectionString ? 'Using connection string' : (dbConfig.database || 'Not set'),
  port: dbConfig.connectionString ? 'Using connection string' : (dbConfig.port || 'Not set'),
  ssl: dbConfig.ssl ? 'SSL enabled' : 'SSL disabled'
});

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection when server starts
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
    console.error('Error details:', err);
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

module.exports = pool;
