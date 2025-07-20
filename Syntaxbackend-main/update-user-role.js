// Script to update a user role from guest to admin
const pool = require('./config/db_connect');

// Email and new role to set
const userEmail = 'admin@gmail.com';
const newRole = 'admin';

// First get the user ID from email
pool.query('SELECT user_id FROM user_table WHERE user_email_address = $1', [userEmail])
    .then(result => {
        if (result.rows.length === 0) {
            console.error(`No user found with email: ${userEmail}`);
            process.exit(1);
        }
        
        const userId = result.rows[0].user_id;
        console.log(`Found user with ID: ${userId}`);
        
        // Update the role in user_role_table
        return pool.query('UPDATE user_role_table SET role = $1 WHERE user_id = $2', [newRole, userId])
            .then(res => {
                console.log(`Role updated to ${newRole} in user_role_table. Affected rows:`, res.rowCount);
                
                // Also update the user_table for consistency
                return pool.query('UPDATE user_table SET user_role = $1 WHERE user_id = $2', [1, userId]);
            });
    })
    .then(res => {
        console.log(`User table role updated to 1 (admin). Affected rows:`, res.rowCount);
        console.log(`User ${userEmail} is now an admin.`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Error updating role:', err);
        process.exit(1);
    });