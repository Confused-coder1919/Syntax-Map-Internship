// Simple script to add missing columns to example_table
const pool = require('./config/db_connect');

async function runMigration() {
  console.log('Starting migration to add new columns to example_table...');
  
  const queries = [
    // Add user_id column if it doesn't exist
    `DO $$ 
     BEGIN 
       IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name='example_table' AND column_name='user_id') THEN
         ALTER TABLE example_table ADD COLUMN user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE;
       END IF;
     END $$;`,
    
    // Add shared_with_teacher column if it doesn't exist
    `DO $$ 
     BEGIN 
       IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name='example_table' AND column_name='shared_with_teacher') THEN
         ALTER TABLE example_table ADD COLUMN shared_with_teacher BOOLEAN DEFAULT FALSE;
       END IF;
     END $$;`,
    
    // Add sentence_type column if it doesn't exist
    `DO $$ 
     BEGIN 
       IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name='example_table' AND column_name='sentence_type') THEN
         ALTER TABLE example_table ADD COLUMN sentence_type VARCHAR(50) DEFAULT 'affirmative';
       END IF;
     END $$;`,
    
    // Add teacher_feedback column if it doesn't exist
    `DO $$ 
     BEGIN 
       IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name='example_table' AND column_name='teacher_feedback') THEN
         ALTER TABLE example_table ADD COLUMN teacher_feedback TEXT;
       END IF;
     END $$;`,
    
    // Add created_at column if it doesn't exist
    `DO $$ 
     BEGIN 
       IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name='example_table' AND column_name='created_at') THEN
         ALTER TABLE example_table ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
       END IF;
     END $$;`,
    
    // Copy values from submitter_id to user_id where possible
    `UPDATE example_table SET user_id = submitter_id 
     WHERE user_id IS NULL AND submitter_id IS NOT NULL;`,
    
    // Create indexes if they don't exist
    `DO $$ 
     BEGIN 
       IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_example_user_id') THEN
         CREATE INDEX idx_example_user_id ON example_table(user_id);
       END IF;
     END $$;`,
    
    `DO $$ 
     BEGIN 
       IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_example_tense_id') THEN
         CREATE INDEX idx_example_tense_id ON example_table(tense_id);
       END IF;
     END $$;`,
    
    `DO $$ 
     BEGIN 
       IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_example_shared') THEN
         CREATE INDEX idx_example_shared ON example_table(shared_with_teacher);
       END IF;
     END $$;`,
    
    `DO $$ 
     BEGIN 
       IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_example_sentence_type') THEN
         CREATE INDEX idx_example_sentence_type ON example_table(sentence_type);
       END IF;
     END $$;`
  ];
  
  try {
    console.log('Connected to database, applying migrations...');
    
    // Execute each query individually
    for (const query of queries) {
      try {
        console.log(`Executing migration query...`);
        await pool.query(query);
        console.log('Query executed successfully');
      } catch (err) {
        console.error('Error executing query:', err.message);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // End the connection pool
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the migration
runMigration();