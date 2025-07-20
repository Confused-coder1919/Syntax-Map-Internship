/**
 * Database Schema Synchronization Script
 * 
 * Run this script to sync your database with the schemas.sql file:
 * node sync-db.js
 */

const { syncDatabase } = require('./config/sync-database');
const fs = require('fs');
const path = require('path');

// Function to fix known schema issues before synchronization
async function fixSchemaIssues() {
  try {
    console.log('🔧 Checking and fixing schema issues before synchronization...');
    
    const schemaPath = path.join(__dirname, 'schemas.sql');
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Fix 1: Update the notepad_table to use VARCHAR(40) instead of UUID to match user_table.user_id
    schemaContent = schemaContent.replace(
      /CREATE TABLE IF NOT EXISTS notepad_table \(\s*id UUID PRIMARY KEY,\s*user_id UUID NOT NULL,/g, 
      'CREATE TABLE IF NOT EXISTS notepad_table (\n  id UUID PRIMARY KEY,\n  user_id VARCHAR(40) NOT NULL,'
    );
    
    // Fix 2: Fix the role_request_table by ensuring current_role is properly quoted if needed
    schemaContent = schemaContent.replace(
      /current_role INTEGER NOT NULL,/g,
      '"current_role" INTEGER NOT NULL,'
    );
    
    // Fix 3: Add additional fixes for any other UUID vs VARCHAR mismatches
    schemaContent = schemaContent.replace(
      /REFERENCES user_table\(user_id\) ON DELETE CASCADE,\s*reference_id UUID/g,
      'REFERENCES user_table(user_id) ON DELETE CASCADE,\n  reference_id VARCHAR(40)'
    );
    
    // Fix 4: Update any other UUID data types that need to be VARCHAR(40)
    schemaContent = schemaContent.replace(/id UUID PRIMARY KEY/g, 'id VARCHAR(40) PRIMARY KEY');
    
    // Write the fixed schema back to file
    fs.writeFileSync(schemaPath, schemaContent);
    console.log('✅ Schema file updated with fixes');
    
    // Add functionality to reset problematic tables
    const pool = require('./config/db_connect');
    
    // List of tables that may need to be reset due to errors
    const problematicTables = ['notepad_table', 'role_request_table'];
    
    for (const tableName of problematicTables) {
      try {
        console.log(`🔄 Attempting to reset table: ${tableName}`);
        
        // Check if the table exists
        const tableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [tableName]);
        
        if (tableExists.rows[0].exists) {
          // Drop the table if it exists
          await pool.query(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
          console.log(`✅ Successfully dropped table ${tableName} for recreation`);
        } else {
          console.log(`ℹ️ Table ${tableName} doesn't exist yet - it will be created`);
        }
      } catch (err) {
        console.error(`❌ Error resetting table ${tableName}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing schema issues:', error);
  }
}

// Main function to run the synchronization with fixes
async function runSyncWithFixes() {
  try {
    console.log('🔄 Starting database synchronization process...');
    
    // First fix any known schema issues
    await fixSchemaIssues();
    
    // Then run the synchronization
    await syncDatabase();
    
    console.log('✅ Database synchronization completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database synchronization failed:', err);
    process.exit(1);
  }
}

// Start the process
runSyncWithFixes();