// import postgresql client -> 'pool'
const pool = require("../../config/db_connect");

//import uuid module
const { v4: uuidv4 } = require("uuid");

// import user ressources
const User = require("./User.js");

//import Interface Dao
const InterfaceDao = require("../InterfaceDao.js");

class UserDao extends InterfaceDao {
  constructor() {
    super();
  }

  // USER DAO : Public methods

  INSERT(user, callback) {
    console.log("USER_DAO");
    console.log("User object for insert:", JSON.stringify(user.toObject(true, true, true), null, 2));
    const userId = uuidv4();
    
    // Map user_type to role_id if needed, or use the provided role directly
    let roleId = user.user_role || 4; // Default to guest (4)
    
    console.log("Using role ID:", roleId);
    
    // Role mapping - convert numeric role IDs to string role names
    const roleMapping = {
      1: 'admin',
      2: 'teacher',
      3: 'student',
      4: 'guest'
    };
    
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry time to 10 minutes from now
    const now = new Date();
    const otpExpiry = new Date(now.getTime() + 10 * 60000); // 10 minutes in milliseconds
    
    const values = [
      userId,
      user.user_name,
      user.user_email_address,
      user.user_password,
      roleId,
      otp,
      otpExpiry,
    ];
    
    const qtext = `INSERT INTO user_table(
      user_id, 
      user_name, 
      user_email_address, 
      user_password, 
      user_role, 
      user_email_verified,
      otp_code,
      otp_expiry,
      is_account_active
    ) VALUES (
      ${this.dv(values[0])}, 
      ${this.dv(values[1])}, 
      ${this.dv(values[2])}, 
      ${this.dv(values[3])},
      ${this.dv(values[4])}, 
      false,
      ${this.dv(values[5])},
      ${this.dv(values[6])},
      false
    )`;
    
    console.log(qtext);
    
    // Use a transaction to ensure both tables are updated together
    pool.connect()
      .then(client => {
        client.query('BEGIN')
          .then(() => {
            // Step 1: Insert into user_table
            return client.query(qtext);
          })
          .then(() => {
            // Step 2: Insert into user_role_table
            const roleString = roleMapping[roleId] || 'guest';
            const roleEntryId = uuidv4(); // Changed variable name from roleId to roleEntryId to avoid conflict
            
            console.log(`Creating role entry for user ${userId} with role ${roleString} (${roleEntryId})`);
            
            return client.query(`
              INSERT INTO user_role_table (id, user_id, role) 
              VALUES ($1, $2, $3)
            `, [roleEntryId, userId, roleString]);
          })
          .then(() => {
            // If both inserts were successful, commit the transaction
            return client.query('COMMIT');
          })
          .then(() => {
            // Release the client back to the pool
            client.release();
            
            // Set the user properties and return the user object
            user.user_id = userId;
            user.otp_code = otp;
            user.otp_expiry = otpExpiry;
            callback(user);
          })
          .catch(err => {
            // If any error occurs, rollback the transaction
            client.query('ROLLBACK')
              .then(() => {
                client.release();
                this.ErrorHandling(err, callback);
              })
              .catch(() => {
                client.release();
                this.ErrorHandling(err, callback);
              });
          });
      })
      .catch(err => {
        this.ErrorHandling(err, callback);
      });
  }

  UPDATE(user, callback) {
    const userId = user.user_id;
    const values = [
      userId,
      user.user_name,
      user.user_email_address,
      user.user_password,
      user.user_gender,
      user.last_session,
      user.user_role,
    ];
    const qtext = `UPDATE user_table SET 
      user_name = ${this.dv(values[1])}, 
      user_email_address = ${this.dv(values[2])}, 
      user_password = ${this.dv(values[3])}, 
      user_gender = ${this.dv(values[4])}, 
      last_session = ${this.dv(values[5])},
      user_role = ${this.dv(values[6])}
      WHERE user_id = ${this.dv(values[0])}`;
    console.log(qtext);
    pool
      .query(qtext)
      .then((res) => {
        console.log(res);
        if (res.rowCount === 0)
          this.ErrorHandling(
            {
              code: "_1",
              id: userId,
            },
            callback
          );
        callback(user);
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }

  UPDATE_password(user, callback) {
    const values = [user.user_email_address, user.user_password];
    const qtext = `UPDATE user_table SET user_password = ${this.dv(
      values[1]
    )}, user_email_verified = true WHERE user_email_address = ${this.dv(
      values[0]
    )}`;
    console.log(qtext);
    pool
      .query(qtext)
      .then((res) => {
        console.log(res);
        if (res.rowCount === 0)
          this.ErrorHandling(
            {
              code: "_3",
              email: user.user_email_address,
            },
            callback
          );
        callback(user);
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }

  UPDATE_last_session(user, callback) {
    const userId = user.user_id;
    const values = [userId, user.last_session];
    const qtext = `UPDATE user_table SET last_session = ${this.dv(
      values[1]
    )} WHERE user_id = ${this.dv(values[0])}`;
    console.log(qtext);
    pool
      .query(qtext)
      .then((res) => {
        console.log(res);
        if (res.rowCount === 0)
          this.ErrorHandling(
            {
              code: "_1",
              id: userId,
            },
            callback
          );
        callback(user);
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }
  
  // New method to verify OTP
  VERIFY_OTP(user, callback) {
    const values = [user.user_email_address, user.otp_code];
    const qtext = `
      UPDATE user_table 
      SET user_email_verified = true, is_account_active = true 
      WHERE user_email_address = ${this.dv(values[0])} 
      AND otp_code = ${this.dv(values[1])} 
      AND otp_expiry > NOW()`;
    
    console.log(qtext);
    pool
      .query(qtext)
      .then((res) => {
        console.log(res);
        if (res.rowCount === 0) {
          this.ErrorHandling(
            {
              code: "OTP_INVALID",
              message: "Invalid or expired OTP",
            },
            callback
          );
        } else {
          callback(user);
        }
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }
  
  // New method to generate and save new OTP
  GENERATE_OTP(user, callback) {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry time to 10 minutes from now
    const now = new Date();
    const otpExpiry = new Date(now.getTime() + 10 * 60000); // 10 minutes
    
    const values = [user.user_email_address, otp, otpExpiry];
    
    console.log("========== GENERATE_OTP ==========");
    console.log("Generating OTP for user:", user.user_email_address);
    console.log("Generated OTP:", otp);
    console.log("OTP Expiry:", otpExpiry);
    
    const qtext = `
      UPDATE user_table 
      SET otp_code = ${this.dv(values[1])}, 
      otp_expiry = ${this.dv(values[2])} 
      WHERE user_email_address = ${this.dv(values[0])}
      RETURNING user_id, user_name, user_email_address, otp_code, otp_expiry`;
    
    console.log("SQL Query:", qtext);
    
    pool
      .query(qtext)
      .then((res) => {
        console.log("Query result rows:", res.rowCount);
        
        if (res.rowCount === 0) {
          console.error("No user found with email:", user.user_email_address);
          this.ErrorHandling(
            {
              code: "USER_NOT_FOUND",
              message: "User not found"
            },
            callback
          );
        } else {
          console.log("OTP updated successfully for user:", res.rows[0].user_id);
          // Update the user object with returned values
          user.user_id = res.rows[0].user_id;
          user.user_name = res.rows[0].user_name;
          user.otp_code = otp;
          user.otp_expiry = otpExpiry;
          callback(user);
        }
      })
      .catch((err) => {
        console.error("Error generating OTP:", err);
        this.ErrorHandling(err, callback);
      });
  }
  
  // New method to update user role (for admin use)
  UPDATE_ROLE(user, callback) {
    const values = [user.user_id, user.user_role];
    
    // Role mapping - convert numeric role IDs to string role names
    const roleMapping = {
      1: 'admin',
      2: 'teacher',
      3: 'student',
      4: 'guest'
    };
    
    const roleString = roleMapping[user.user_role] || 'guest';
    
    // Use a transaction to update both tables
    pool.connect()
      .then(client => {
        client.query('BEGIN')
          .then(() => {
            // Step 1: Update user_table
            return client.query(`
              UPDATE user_table 
              SET user_role = ${this.dv(values[1])} 
              WHERE user_id = ${this.dv(values[0])}
            `);
          })
          .then(res => {
            if (res.rowCount === 0) {
              // If user doesn't exist, throw an error to trigger the catch block
              throw {
                code: "USER_NOT_FOUND",
                message: "User not found"
              };
            }
            
            // Step 2: Check if entry exists in user_role_table
            return client.query(`
              SELECT id FROM user_role_table WHERE user_id = $1
            `, [user.user_id]);
          })
          .then(res => {
            if (res.rows.length > 0) {
              // Entry exists, update it
              const roleEntryId = res.rows[0].id;
              return client.query(`
                UPDATE user_role_table 
                SET role = $1, updated_at = NOW()
                WHERE id = $2
              `, [roleString, roleEntryId]);
            } else {
              // No entry exists, create a new one
              const roleEntryId = uuidv4(); // Changed from roleId to roleEntryId for consistency
              return client.query(`
                INSERT INTO user_role_table (id, user_id, role) 
                VALUES ($1, $2, $3)
              `, [roleEntryId, user.user_id, roleString]);
            }
          })
          .then(() => {
            // If both operations were successful, commit the transaction
            return client.query('COMMIT');
          })
          .then(() => {
            // Release the client back to the pool
            client.release();
            
            // Return the updated user
            callback(user);
          })
          .catch(err => {
            // If any error occurs, rollback the transaction
            client.query('ROLLBACK')
              .then(() => {
                client.release();
                this.ErrorHandling(err, callback);
              })
              .catch(() => {
                client.release();
                this.ErrorHandling(err, callback);
              });
          });
      })
      .catch(err => {
        this.ErrorHandling(err, callback);
      });
  }

  SELECT(criteria, callback) {
    // Enhanced query that explicitly selects user_id and adds logging
    let qtext =
      "SELECT user_table.user_id as user_id, user_table.user_name as user_name, user_table.user_email_address as user_email_address, user_table.user_gender as user_gender, user_table.user_role as user_role, user_table.user_password as user_password, user_table.last_session as last_session, user_table.user_email_verified as user_email_verified, user_table.is_account_active as is_account_active FROM user_table";
      
    if (criteria.user_name)
      qtext = this.actq(qtext, "user_name", criteria.user_name);
    if (criteria.userId || criteria.user_id)
      qtext = this.actq(
        qtext,
        "user_id",
        criteria.userId || criteria.user_id,
        "user_table.user_id"
      );
    if (criteria.user_email_address)
      qtext = this.actq(
        qtext,
        "user_email_address",
        criteria.user_email_address
      );
    if (criteria.user_gender)
      qtext = this.actq(qtext, "user_gender", criteria.user_gender);
    if (criteria.user_role)
      qtext = this.actq(qtext, "user_role", criteria.user_role);
      
    console.log("User SELECT query:", qtext);
    
    pool
      .query(qtext)
      .then((res) => {
        console.log(`Found ${res.rows.length} users in database`);
        if (res.rows.length > 0) {
          // Log first user to check structure (excluding sensitive data)
          const sampleUser = {...res.rows[0]};
          delete sampleUser.user_password;
          console.log("Sample user data structure:", sampleUser);
        }
        
        let users = [];
        res.rows.forEach((item) => {
          const user = new User(null, item, null);
          // Check if user ID exists
          console.log(`Creating user object for ${item.user_name}, ID: ${item.user_id}`);
          users.push(user);
        });
        
        callback(users);
      })
      .catch((err) => {
        console.error("Error in UserDao SELECT:", err);
        this.ErrorHandling(err, callback);
      });
  }

  DELETE(user, callback) {
    const qtext = "DELETE FROM user_table WHERE user_id = $1";
    const userId = user.user_id;
    const values = [userId];
    console.log(values);
    pool
      .query(qtext, values)
      .then((res) => {
        if (res.rowCount === 0)
          this.ErrorHandling(
            {
              code: "_1",
              id: userId,
            },
            callback
          );
        callback(res);
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }

  // New methods for login attempt tracking
  INCREMENT_LOGIN_ATTEMPTS(user, callback) {
    const values = [user.user_email_address];
    const currentTime = new Date().toISOString();
    
    // First get the current attempts count
    const selectQuery = `
      SELECT login_attempts, account_locked_until 
      FROM user_table 
      WHERE user_email_address = ${this.dv(values[0])}`;
      
    pool.query(selectQuery)
      .then((res) => {
        if (res.rowCount === 0) {
          this.ErrorHandling({
            code: "USER_NOT_FOUND",
            message: "User not found"
          }, callback);
          return;
        }
        
        // Get current attempts and locked status
        const loginAttempts = (res.rows[0].login_attempts || 0) + 1;
        const accountLockedUntil = res.rows[0].account_locked_until;
        
        // Check if account should be locked (5 or more failed attempts)
        let newLockTime = null;
        if (loginAttempts >= 5) {
          // Lock account for 15 minutes after 5 attempts
          newLockTime = new Date(new Date().getTime() + 15 * 60000).toISOString();
        }
        
        // Update the login attempts and lock status if needed
        const updateQuery = `
          UPDATE user_table 
          SET login_attempts = ${loginAttempts}, 
              last_login_attempt = '${currentTime}',
              account_locked_until = ${newLockTime ? `'${newLockTime}'` : 'account_locked_until'}
          WHERE user_email_address = ${this.dv(values[0])}`;
          
        return pool.query(updateQuery);
      })
      .then((updateRes) => {
        if (!updateRes) return; // Skip if we had an early return
        
        user.login_attempts = updateRes.rows[0]?.login_attempts || 1;
        user.last_login_attempt = currentTime;
        user.account_locked_until = updateRes.rows[0]?.account_locked_until || null;
        
        callback(user);
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }
  
  RESET_LOGIN_ATTEMPTS(user, callback) {
    const values = [user.user_email_address];
    const qtext = `
      UPDATE user_table 
      SET login_attempts = 0,
          account_locked_until = NULL
      WHERE user_email_address = ${this.dv(values[0])}`;
      
    pool.query(qtext)
      .then((res) => {
        if (res.rowCount === 0) {
          this.ErrorHandling({
            code: "USER_NOT_FOUND",
            message: "User not found"
          }, callback);
        } else {
          user.login_attempts = 0;
          user.account_locked_until = null;
          callback(user);
        }
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }
  
  CHECK_ACCOUNT_LOCK(user, callback) {
    const values = [user.user_email_address];
    const qtext = `
      SELECT login_attempts, account_locked_until 
      FROM user_table 
      WHERE user_email_address = ${this.dv(values[0])}`;
      
    pool.query(qtext)
      .then((res) => {
        if (res.rowCount === 0) {
          this.ErrorHandling({
            code: "USER_NOT_FOUND",
            message: "User not found"
          }, callback);
        } else {
          const loginAttempts = res.rows[0].login_attempts || 0;
          const accountLockedUntil = res.rows[0].account_locked_until;
          
          // Check if account is locked
          const now = new Date();
          const isLocked = accountLockedUntil && new Date(accountLockedUntil) > now;
          
          // Calculate remaining lock time in minutes
          const remainingLockTime = isLocked ? 
            Math.ceil((new Date(accountLockedUntil) - now) / 60000) : 0;
          
          callback({
            isLocked: isLocked,
            loginAttempts: loginAttempts,
            remainingLockTime: remainingLockTime,
            accountLockedUntil: accountLockedUntil
          });
        }
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }

  // USER DAO : private methods
}

module.exports = UserDao;
