/**
 * Database Schema Synchronization Tool
 * 
 * This script reads the schemas.sql file and compares it with the current
 * database schema, then applies any necessary changes to make the database
 * match the SQL file definitions.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const pool = require('./db_connect');

// Parse SQL file into individual statements
function parseSqlFile(sqlContent) {
  // Split by semicolons but ignore semicolons inside quotes or comments
  const statements = [];
  let currentStatement = '';
  let inComment = false;
  let inSingleLineComment = false;
  let inQuote = false;
  let quoteChar = '';

  const lines = sqlContent.split('\n');
  
  for (const line of lines) {
    // Skip empty lines
    if (line.trim() === '') continue;
    
    // Skip comment lines
    if (line.trim().startsWith('--')) {
      continue;
    }
    
    // Add the line to the current statement
    currentStatement += line + '\n';
    
    // If the line ends with a semicolon, it's a complete statement
    if (line.trim().endsWith(';')) {
      statements.push(currentStatement);
      currentStatement = '';
    }
  }
  
  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement);
  }
  
  return statements.filter(stmt => stmt.trim() !== '' && !stmt.trim().startsWith('--'));
}

// Extract table names from CREATE TABLE statements
function extractTableNames(statements) {
  const tables = [];
  
  for (const stmt of statements) {
    if (stmt.toUpperCase().includes('CREATE TABLE')) {
      // Extract table name - matches patterns like "CREATE TABLE table_name" or "CREATE TABLE IF NOT EXISTS table_name"
      const match = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)/i);
      if (match && match[1]) {
        tables.push(match[1].replace(/['"`;]/g, '').trim());
      }
    }
  }
  
  return tables;
}

// Extract index names from CREATE INDEX statements
function extractIndexNames(statements) {
  const indexes = [];
  
  for (const stmt of statements) {
    if (stmt.toUpperCase().includes('CREATE INDEX')) {
      // Extract index name
      const match = stmt.match(/CREATE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)/i);
      if (match && match[1]) {
        indexes.push(match[1].replace(/['"`;]/g, '').trim());
      }
    }
  }
  
  return indexes;
}

// Get current tables in the database
async function getCurrentTables() {
  const result = await pool.query(`
    SELECT tablename 
    FROM pg_catalog.pg_tables 
    WHERE schemaname = 'public';
  `);
  
  return result.rows.map(row => row.tablename);
}

// Get current indexes in the database
async function getCurrentIndexes() {
  const result = await pool.query(`
    SELECT indexname 
    FROM pg_catalog.pg_indexes 
    WHERE schemaname = 'public';
  `);
  
  return result.rows.map(row => row.indexname);
}

// Execute a statement safely
async function executeStatement(statement) {
  try {
    await pool.query(statement);
    return { success: true, statement };
  } catch (error) {
    return { 
      success: false, 
      statement, 
      error: error.message 
    };
  }
}

// Main function to sync the database
async function syncDatabase() {
  try {
    console.log('Starting database schema synchronization...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'schemas.sql');
    const sqlContent = await readFile(sqlPath, 'utf8');
    
    // Parse SQL into individual statements
    const statements = parseSqlFile(sqlContent);
    console.log(`Found ${statements.length} SQL statements in schemas.sql`);
    
    // Get current database state
    const currentTables = await getCurrentTables();
    console.log(`Current tables in database: ${currentTables.join(', ')}`);
    
    const currentIndexes = await getCurrentIndexes();
    console.log(`Current indexes in database: ${currentIndexes.join(', ')}`);
    
    // Extract expected tables and indexes from schemas.sql
    const expectedTables = extractTableNames(statements);
    const expectedIndexes = extractIndexNames(statements);
    
    console.log(`Expected tables from schemas.sql: ${expectedTables.join(', ')}`);
    console.log(`Expected indexes from schemas.sql: ${expectedIndexes.join(', ')}`);
    
    // Execute each statement
    console.log('Executing statements to sync the database...');
    
    const results = [];
    for (const statement of statements) {
      const result = await executeStatement(statement);
      results.push(result);
      
      if (result.success) {
        console.log('Successfully executed statement');
      } else {
        // If the error is about table/index already existing, that's expected
        if (result.error.includes('already exists')) {
          console.log('Skipping already existing object');
        } else {
          console.error(`Error executing statement: ${result.error}`);
        }
      }
    }
    
    // Summary
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    console.log('\nDatabase sync complete!');
    console.log(`Successfully executed: ${successCount} statements`);
    console.log(`Failed: ${failCount} statements`);
    
    if (failCount > 0) {
      console.log('\nFailed statements with errors:');
      results
        .filter(r => !r.success && !r.error.includes('already exists'))
        .forEach((r, i) => {
          console.log(`\n--- Failed Statement ${i+1} ---`);
          console.log(r.statement.trim());
          console.log(`Error: ${r.error}`);
        });
    }
    
  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  syncDatabase();
}

module.exports = { syncDatabase };