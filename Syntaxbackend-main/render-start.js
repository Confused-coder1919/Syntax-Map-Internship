// This file is specifically for Render deployment
// It uses absolute paths to ensure the correct file is loaded

// Mark this as a Render environment for the db_connect.js detection
process.env.RENDER = 'true';
process.env.IS_RENDER = 'true';

// Load environment variables from .env file if it exists (do this FIRST)
try {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
  console.log('✅ Environment variables loaded from .env file');
} catch (error) {
  console.log('⚠️ No .env file found, using environment variables from the system');
}

// Force SSL mode for Render PostgreSQL connections
process.env.PGSSLMODE = 'no-verify';

// Ensure database connection is set up correctly for Render 
// by prioritizing EXTERNAL_DATABASE_URL if available
if (process.env.EXTERNAL_DATABASE_URL) {
  console.log('✅ Using EXTERNAL_DATABASE_URL for database connection');
  process.env.DATABASE_URL = process.env.EXTERNAL_DATABASE_URL;
} else if (process.env.DATABASE_URL) {
  console.log('✅ Using existing DATABASE_URL');
} else if (process.env.DB_HOST && process.env.DB_NAME) {
  console.log('✅ Creating DATABASE_URL from individual parameters');
  // Construct a DATABASE_URL from individual parameters
  const dbUser = encodeURIComponent(process.env.DB_USER || 'undefined');
  const dbPass = encodeURIComponent(process.env.DB_PASSWORD || 'undefined');
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME;
  
  process.env.DATABASE_URL = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
} else {
  console.error('⚠️ No database connection information found. This will likely cause connection errors!');
  console.error('Please set DATABASE_URL or individual database parameters in your Render environment variables');
}

// Log essential environment variables for debugging
console.log('Database connection info (Render startup):');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (value hidden)' : 'Not set');
console.log('EXTERNAL_DATABASE_URL:', process.env.EXTERNAL_DATABASE_URL ? 'Set (value hidden)' : 'Not set');
console.log('DB_HOST:', process.env.DB_HOST || 'Not set');
console.log('DB_NAME:', process.env.DB_NAME || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('RENDER:', process.env.RENDER || 'Not set');
console.log('RENDER_EXTERNAL_URL:', process.env.RENDER_EXTERNAL_URL || 'Not set');

const path = require('path');
console.log('Starting application from render-start.js');
require(path.join(__dirname, 'app-v2.js'));