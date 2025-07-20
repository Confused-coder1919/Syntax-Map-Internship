// Check database tables
console.log("Checking database tables...");
const pool = require("./config/db_connect");

// Check if quiz_details table exists
pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quiz_details')")
    .then(res => {
        console.log("quiz_details table exists:", res.rows[0].exists);
        
        // Check if question_table exists
        return pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'question_table')");
    })
    .then(res => {
        console.log("question_table exists:", res.rows[0].exists);
        
        // List all tables in the database
        return pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    })
    .then(res => {
        console.log("Available tables in database:");
        console.table(res.rows);
        pool.end();
    })
    .catch(err => {
        console.error("Error:", err);
        pool.end();
    });