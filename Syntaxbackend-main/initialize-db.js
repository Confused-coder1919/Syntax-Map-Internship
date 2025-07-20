const fs = require('fs');
const path = require('path');
const db = require('./config/db_connect');
require('dotenv').config();

// Function to log messages with timestamps
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// Main function to initialize the database
async function initializeDatabase() {
  log('Starting database initialization...');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'schemas.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    log(`SQL file loaded from: ${sqlPath}`);
    
    // Split SQL into individual statements (this is a simple approach and might need refinement)
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    log(`Found ${statements.length} SQL statements to execute`);

    // Start a client from the pool
    const client = await db.connect();
    
    try {
      // Execute each statement in its own transaction
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        try {
          log(`Executing statement ${i + 1} of ${statements.length}`);
          await client.query('BEGIN');
          await client.query(statement);
          await client.query('COMMIT');
          log(`Statement ${i + 1} executed successfully`);
        } catch (err) {
          // Rollback this specific statement's transaction
          await client.query('ROLLBACK');
          
          // If the error is about the relation already existing, we can continue
          if (err.code === '42P07') {
            log(`Table already exists, continuing: ${err.message}`);
          } 
          // Foreign key constraint error - can happen if tables are created out of dependency order
          else if (err.code === '23503' || err.code === '23505' || err.code === '23514') {
            log(`Constraint error, will retry later: ${err.message}`);
            // Add to the end to try again later (after dependencies might be created)
            statements.push(statement);
          } 
          // Other error that might not be fatal
          else {
            log(`Error executing statement ${i + 1}: ${err.message}`);
            log(`Failed statement: ${statement.substring(0, 100)}...`);
            // Continue with other statements
          }
        }
      }
      
      log('All SQL statements execution attempted');
      
      // Query to check if quiz_details table exists
      const tableCheckResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'quiz_details'
        )`
      );
      
      const quizDetailsExists = tableCheckResult.rows[0].exists;
      log(`quiz_details table exists: ${quizDetailsExists}`);
      
      // If quiz_details table doesn't exist, create it specifically
      if (!quizDetailsExists) {
        try {
          log('Creating quiz_details table specifically...');
          await client.query('BEGIN');
          await client.query(`
            CREATE TABLE quiz_details (
              id VARCHAR(40) NOT NULL UNIQUE,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              tense_id VARCHAR(40) REFERENCES tense_table(id) ON DELETE CASCADE,
              difficulty_level INTEGER NOT NULL,
              time_per_question INTEGER NOT NULL,
              number_of_questions INTEGER NOT NULL,
              status VARCHAR(10) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW()
            )
          `);
          await client.query('COMMIT');
          log('quiz_details table created successfully');
        } catch (err) {
          await client.query('ROLLBACK');
          log(`Error creating quiz_details table: ${err.message}`);
        }
      }
      
    } catch (err) {
      log(`Unexpected error during execution: ${err.message}`);
      log(err.stack);
    } finally {
      // Release client back to pool
      client.release();
      log('Database client released');
    }

    log('Database initialization completed');
    
  } catch (err) {
    log(`Error initializing database: ${err.message}`);
    log(err.stack);
  } finally {
    // Close the pool and exit
    await db.end();
    log('Connection pool closed');
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    log('Database initialization script completed');
    process.exit(0);
  })
  .catch(err => {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
  });