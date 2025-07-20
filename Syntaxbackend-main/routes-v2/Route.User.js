// import user ressources
const User = require("../modules/Ressources.User/User.js");
const UserService = require("../modules/Ressources.User/UserService.js");
const UserRoleService = require("../modules/Ressources.UserRole/UserRoleService.js");

// import jwt
const issueJWTLogin = require("../modules/Token/jwtLogin");
const issueJWTVerification = require("../modules/Token/jwtConfirmation");

// import decoder jwt
const jwtDecode = require("jwt-decode");

// import bcrypt
const bcrypt = require("bcrypt");

// import passport
var passport = require("passport");

// import uuid for generating unique IDs
const { v4: uuidv4 } = require('uuid');

// import database connection
const pool = require('../config/db_connect');

// Ensure dotenv is configured before setting the API key
require('dotenv').config();

// import Brevo (formerly Sendinblue) email client
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || '';
if (!apiKey.apiKey) {
  console.warn('⚠️ Warning: BREVO_API_KEY environment variable is not set. Email functionality will not work.');
}
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

//import ErrorObject
const ErrorObject = require("../modules/error/ErrorObject.js");

module.exports = (app) => {
  var userService = new UserService();
  var userRoleService = new UserRoleService();

  // Helper function to send OTP email
  const sendOTPEmail = async (user) => {
    try {
      console.log(`Preparing to send OTP email to: ${user.user_email_address}`);
      console.log(`Using Brevo API key`);
      
      // Verify we have a valid user object with required fields
      if (!user || !user.user_email_address || !user.otp_code) {
        console.error('Missing required user data for OTP email:', 
          { hasUser: !!user, hasEmail: user && !!user.user_email_address, hasOTP: user && !!user.otp_code });
        return false;
      }
      
      // Use a valid sender email
      const fromEmail = 'chandrayee.cse@gmail.com'; // Replace with your verified email
      console.log(`Sending from email: ${fromEmail}`);
      
      // Create the email content
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">SyntaxMap</h2>
          <p>Hello ${user.user_name || ''},</p>
          <p>Your one-time password (OTP) is:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #111827; letter-spacing: 5px; font-size: 32px;">${user.otp_code}</h1>
          </div>
          <p>This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>– SyntaxMap Team</p>
        </div>
      `;
      
      const textContent = `Hello ${user.user_name || ''},\n\nYour one-time password (OTP) is: ${user.otp_code}\nThis code will expire in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.\n\nIf you did not request this, please ignore this email.\n\n– SyntaxMap Team`;
      
      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      sendSmtpEmail = {
        sender: { email: fromEmail, name: 'SyntaxMap' },
        to: [{ email: user.user_email_address }],
        subject: 'Your SyntaxMap OTP Code',
        htmlContent: htmlContent,
        textContent: textContent
      };
      
      console.log('Attempting to send email with Brevo...');
      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Brevo response:', JSON.stringify(response));
      console.log(`OTP email sent successfully to ${user.user_email_address}`);
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error.message);
      console.error('Error details:', error);
      return false;
    }
  };

  // Check user role/authorization
  app.post("/user/role", (req, res) => {
    try {
      // Check if the Authorization header exists
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        return res
          .status(401)
          .json({ msg: "No token provided. Unauthorized access" });
      }

      // Decode the token from the Authorization header
      const token = authHeader.split(" ")[1];

      if (!token) {
        return res
          .status(401)
          .json({ msg: "Invalid token format. Unauthorized access" });
      }

      const decodedToken = jwtDecode(token);

      // Check if the user ID exists in the decoded token
      if (!decodedToken.sub) {
        return res.status(401).json({ msg: "Unauthorized access" });
      }

      // First check if the role is already in the token
      if (decodedToken.user_role) {
        console.log(`Role found in token: ${decodedToken.user_role}`);
        return res.status(200).json({ role: decodedToken.user_role });
      }

      // Fetch the user based on the decoded user ID
      const criteria = {
        user_id: decodedToken.sub,
      };

      console.log(criteria, "Criteria");
      
      // Try to get the role from the user_role_table first (preferred)
      userRoleService.SELECT(criteria, (userRoles) => {
        // Check for error object or empty results
        if (!userRoles || userRoles.code || userRoles.length === 0) {
          console.log("No role found in user_role_table, falling back to user_table");
          
          // If no role in user_role_table, try to get it from user_table
          userService.SELECT(criteria, (users) => {
            if (!users || users.code || users.length === 0) {
              return res.status(404).json({ msg: "User not found" });
            }
            
            const user = users[0];
            console.log(`User found in user_table with role: ${user.user_role}`);
            return res.status(200).json({ role: user.user_role });
          });
        } else {
          // Return the user's authorization level from user_role_table
          const userRole = userRoles[0];
          
          // Map string roles to numeric values for consistency
          let roleValue = userRole.role;
          if (typeof roleValue === 'string') {
            switch(roleValue.toLowerCase()) {
              case 'admin':
                roleValue = 1;
                break;
              case 'teacher':
                roleValue = 2;
                break;
              case 'student':
                roleValue = 3;
                break;
              case 'guest':
              default:
                roleValue = 4;
            }
          }
          
          console.log(`Role from user_role_table: ${userRole.role}, normalized to: ${roleValue}`);
          return res.status(200).json({ role: roleValue });
        }
      });
    } catch (error) {
      console.error("Error checking role:", error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });

  // Get all students (accessible only to teachers and admins)
  app.get("/user/students", passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      // Check for authorization header
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        return res.status(401).json({ msg: "No token provided. Unauthorized access" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ msg: "Invalid token format. Unauthorized access" });
      }

      // Decode the token to get user info
      let decodedToken;
      try {
        decodedToken = jwtDecode(token);
      } catch (err) {
        return res.status(401).json({ msg: "Invalid token. Unauthorized access" });
      }

      // Get the user ID from token
      const userId = decodedToken.sub;
      if (!userId) {
        return res.status(401).json({ msg: "User ID not found in token" });
      }

      // Get the requesting user's role
      userService.SELECT({ user_id: userId }, (users) => {
        if (!users || users.length === 0) {
          return res.status(404).json({ msg: "User not found" });
        }

        const userRole = users[0].user_role;
        
        // Only teachers (role 2) and admins (role 1) can access this endpoint
        if (userRole !== 1 && userRole !== 2) {
          return res.status(403).json({ msg: "Access denied. Only teachers and admins can view student lists." });
        }

        // Query to get all students (role 3)
        userService.SELECT({ user_role: 3 }, (students) => {
          if (!students) {
            return res.status(404).json({ msg: "No students found" });
          }

          // Format the response to include only necessary fields
          const studentList = students.map(student => ({
            user_id: student.user_id,
            user_name: student.user_name,
            user_email_address: student.user_email_address
          }));

          return res.status(200).json({ students: studentList });
        });
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  //Get all user
  app.get("/user", (req, res) => {
    try {
      // Add authentication check first
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        return res.status(401).json({ msg: "No token provided. Unauthorized access" });
      }

      // Extract the token and verify it has a valid format
      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ msg: "Invalid token format. Unauthorized access" });
      }

      // Log the token for debugging
      console.log("Token received for user list request:", token.substring(0, 15) + "...");

      // Decode the token to get the requesting user's ID
      let requestingUserId;
      try {
        const decoded = jwtDecode(token);
        requestingUserId = decoded.sub;
        console.log("Request made by user ID:", requestingUserId);
      } catch (tokenError) {
        console.error("Error decoding token:", tokenError);
        return res.status(401).json({ msg: "Invalid token format" });
      }
      
      // Get the requesting user's role to determine what they can see
      userService.SELECT({ user_id: requestingUserId }, (adminUsers) => {
        if (!adminUsers || adminUsers.length === 0) {
          console.error("User not found for ID:", requestingUserId);
          return res.status(404).json({ msg: "User not found" });
        }
        
        const isAdmin = adminUsers[0].user_role === 1;
        console.log("Requesting user is admin:", isAdmin);
        
        // Now get all users
        userService.SELECT({}, (users) => {
          if (!users) {
            return res.status(406).json({ msg: "No users found" });
          } else {
            console.log(`Found ${users.length} users in database`);
            let results = [];
            
            if (isAdmin) {
              // Admin can see all user details
              users.forEach((item) => {
                // true = include password, true = include ID, true = include role
                const userObject = item.toObject(true, true, true);
                console.log(`Processing user: ${userObject.user_email_address}, ID: ${userObject.user_id}`);
                results.push(userObject);
              });
            } else {
              // Non-admin can see limited details, but we still include user IDs for role updates
              users.forEach((item) => {
                // Don't include other admin users for non-admins
                if (item.user_role !== 1) {
                  // false = exclude password, true = include ID, false = exclude role/auth details
                  const userObject = item.toObject(false, true, false);
                  results.push(userObject);
                }
              });
            }
            
            // Check if we have user IDs in the results for debugging
            const hasIds = results.length > 0 && results[0].user_id;
            console.log("Results include user IDs:", hasIds);
            
            return res.status(200).json({ users: results });
          }
        });
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });

  //User Register with OTP verification
  app.post("/user/register", (req, res) => {
    console.log("Registration request received");
    
    try {
      // Validate request body is present and properly parsed
      if (!req.body || Object.keys(req.body).length === 0) {
        console.error("Request body is missing or empty");
        return res.status(400).json({ msg: "Request body is required" });
      }
      
      console.log("Registration data:", {
        email: req.body.user_email_address,
        name: req.body.user_name
      });
      
      // Check if the email already exists
      let emailCheckCriteria = {
        user_email_address: req.body.user_email_address
      };
      
      userService.SELECT(emailCheckCriteria, async (existingUsers) => {
        try {
          // If the email already exists, check if it's verified
          if (existingUsers && existingUsers.length > 0) {
            console.log(`EMAIL CHECK: Email ${req.body.user_email_address} exists in database`);
            
            // Get the existing user
            const existingUser = existingUsers[0];
            console.log(`EMAIL VERIFICATION STATUS: ${existingUser.user_email_verified}`);
            
            // If email exists but is not verified, send a new OTP
            if (!existingUser.user_email_verified) {
              console.log("UNVERIFIED EMAIL DETECTED: Sending new OTP");
              
              // Create a properly formed user object from the existing record
              // This is the key fix - explicitly create a proper User object
              const userForOTP = new User(null, null, {
                user_id: existingUser.user_id,
                user_name: existingUser.user_name,
                user_email_address: existingUser.user_email_address
              });
              
              console.log("Created user object for OTP generation:", userForOTP);
              
              // Generate new OTP
              userService.GENERATE_OTP(userForOTP, async (updatedUser) => {
                if (updatedUser.code) {
                  console.error("Error generating OTP:", updatedUser);
                  return res.status(500).json({ 
                    msg: "Failed to generate verification code. Please try again." 
                  });
                }
                
                console.log("New OTP generated for existing unverified user:", updatedUser.otp_code);
                
                // Send the OTP email
                const emailSent = await sendOTPEmail(updatedUser);
                console.log("OTP email sent:", emailSent);
                
                if (emailSent) {
                  return res.status(200).json({
                    msg: "This email was previously registered but not verified. A new verification code has been sent to your email.",
                    userId: existingUser.user_id,
                    email: existingUser.user_email_address,
                    needsVerification: true
                  });
                } else {
                  return res.status(207).json({
                    msg: "This email was previously registered but not verified. We couldn't send the verification email. Please try the resend option.",
                    userId: existingUser.user_id,
                    email: existingUser.user_email_address,
                    needsVerification: true
                  });
                }
              });
              
              return; // Return early as we're handling the response in the callback
            }
            
            // If we get here, the email exists and is verified - return a conflict error
            console.log("EMAIL VERIFIED: Account already exists and is verified");
            return res.status(409).json({ 
              msg: "This email address is already registered. Please use a different email or try logging in." 
            });
          } else {
            // Email doesn't exist, proceed with normal registration
            console.log("NEW EMAIL: Creating new user account");
            
            // Validate password
            if (!req.body.user_password) {
              console.error("Password missing");
              return res.status(400).json({ msg: "Password is required" });
            }
            
            const password = req.body.user_password;
            
            if (typeof password !== 'string' || password.trim() === '') {
              console.error("Invalid password format");
              return res.status(400).json({ msg: "Password must be a non-empty string" });
            }
            
            try {
              // Hash the password
              console.log("Hashing password...");
              const hashedPassword = bcrypt.hashSync(password, 10);
              
              // Create new user with hashed password
              req.body.user_password = hashedPassword;
              req.body.user_role = 4; // Set as Guest role
              
              let bodyNewUser = new User(null, null, req.body);
              
              // Insert the new user
              console.log("Inserting new user into database");
              userService.INSERT(bodyNewUser, async (newUser) => {
                if (newUser.code) {
                  console.error("Error inserting user:", newUser.errorMessage);
                  return res.status(newUser.code || 500).json({ 
                    msg: newUser.errorMessage || "Error creating user" 
                  });
                }
                
                console.log("User created successfully, sending OTP");
                
                // Send verification OTP
                const emailSent = await sendOTPEmail(newUser);
                
                if (emailSent) {
                  return res.status(200).json({
                    msg: "Account created successfully. Please check your email for the verification code.",
                    userId: newUser.user_id,
                    email: newUser.user_email_address,
                    needsVerification: true
                  });
                } else {
                  return res.status(207).json({
                    msg: "Account created successfully, but we couldn't send the verification email. Please try requesting a new code.",
                    userId: newUser.user_id,
                    email: newUser.user_email_address,
                    needsVerification: true
                  });
                }
              });
            } catch (err) {
              console.error("Error in registration:", err);
              return res.status(500).json({ msg: "Server error during registration" });
            }
          }
        } catch (err) {
          console.error("Error checking existing user:", err);
          return res.status(500).json({ msg: "Error processing registration" });
        }
      });
    } catch (error) {
      console.error("Unexpected error in register route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  // Verify OTP and activate account
  app.post("/user/verify-otp", (req, res) => {
    try {
      // Check if email and OTP are provided
      if (!req.body || !req.body.user_email_address || !req.body.otp_code) {
        return res.status(400).json({ msg: "Email address and OTP code are required" });
      }
      
      // Create a user object with the provided email and OTP
      const user = new User(null, null, {
        user_email_address: req.body.user_email_address,
        otp_code: req.body.otp_code
      });
      
      // Verify the OTP
      userService.VERIFY_OTP(user, (result) => {
        try {
          if (result.code) {
            if (result.code === 'OTP_INVALID') {
              return res.status(400).json({ 
                msg: result.message || "Invalid or expired verification code. Please request a new one."
              });
            } else {
              return res.status(500).json({ 
                msg: result.message || "Error verifying OTP"
              });
            }
          }
          
          // Now get the user details to return with the response
          userService.SELECT({ user_email_address: user.user_email_address }, (users) => {
            if (!users || users.code || users.length === 0) {
              return res.status(404).json({ msg: "User not found" });
            }
            
            // Generate a JWT token for the verified user
            const jstoken = issueJWTLogin(users[0]);
            
            return res.status(200).json({
              msg: "Email verified successfully. Your account is now active.",
              jwt: jstoken,
              user_role: users[0].user_role,
              last_session: users[0].last_session
            });
          });
        } catch (error) {
          console.error("Error in OTP verification:", error);
          return res.status(500).json({ msg: "Error verifying OTP" });
        }
      });
    } catch (error) {
      console.error("Unexpected error in OTP verification route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });
  
  // Resend OTP
  app.post("/user/resend-otp", (req, res) => {
    try {
      // Check if email is provided
      if (!req.body || !req.body.user_email_address) {
        return res.status(400).json({ msg: "Email address is required" });
      }
      
      // Get the user by email
      userService.SELECT({ user_email_address: req.body.user_email_address }, (users) => {
        if (!users || users.code || users.length === 0) {
          return res.status(404).json({ msg: "User not found" });
        }
        
        // Create a user object with the provided email
        const user = new User(null, null, {
          user_email_address: req.body.user_email_address
        });
        
        // Generate a new OTP
        userService.GENERATE_OTP(user, async (result) => {
          try {
            if (result.code) {
              return res.status(500).json({ 
                msg: result.message || "Error generating OTP"
              });
            }
            
            // Send the new OTP via email
            const emailSent = await sendOTPEmail(result);
            
            if (emailSent) {
              return res.status(200).json({
                msg: "Verification code sent successfully. Please check your email."
              });
            } else {
              return res.status(500).json({
                msg: "Failed to send verification code. Please try again later."
              });
            }
          } catch (error) {
            console.error("Error in OTP generation:", error);
            return res.status(500).json({ msg: "Error generating OTP" });
          }
        });
      });
    } catch (error) {
      console.error("Unexpected error in resend OTP route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  // Admin endpoint to update user role
  app.post("/user/update-role", passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      // Get the admin's user ID from the token
      const adminToken = req.get("Authorization").split(" ")[1];
      const adminId = jwtDecode(adminToken).sub;
      
      // Check if the admin has the admin role (1)
      userService.SELECT({ user_id: adminId }, (adminUsers) => {
        if (!adminUsers || adminUsers.code || adminUsers.length === 0) {
          return res.status(404).json({ msg: "Admin user not found" });
        }
        
        const admin = adminUsers[0];
        if (admin.user_role !== 1) {
          return res.status(403).json({ msg: "You don't have permission to perform this action" });
        }
        
        // Check if user ID and new role are provided
        if (!req.body || !req.body.user_id || !req.body.user_role) {
          return res.status(400).json({ msg: "User ID and role are required" });
        }
        
        // Create a user object with the target user ID and new role
        const user = new User(null, null, {
          user_id: req.body.user_id,
          user_role: req.body.user_role
        });
        
        // Update the user's role
        userService.UPDATE_ROLE(user, (result) => {
          try {
            if (result.code) {
              return res.status(500).json({ 
                msg: result.message || "Error updating user role"
              });
            }
            
            return res.status(200).json({
              msg: "User role updated successfully"
            });
          } catch (error) {
            console.error("Error updating user role:", error);
            return res.status(500).json({ msg: "Error updating user role" });
          }
        });
      });
    } catch (error) {
      console.error("Unexpected error in update role route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  // Admin endpoint to update user role by email (for frontend compatibility)
  app.post("/user/update-role-by-email", passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      // Get the admin's user ID from the token
      const adminToken = req.get("Authorization").split(" ")[1];
      const adminId = jwtDecode(adminToken).sub;
      
      // Check if the admin has the admin role (1)
      userService.SELECT({ user_id: adminId }, (adminUsers) => {
        if (!adminUsers || adminUsers.code || adminUsers.length === 0) {
          return res.status(404).json({ msg: "Admin user not found" });
        }
        
        const admin = adminUsers[0];
        if (admin.user_role !== 1) {
          return res.status(403).json({ msg: "You don't have permission to perform this action" });
        }
        
        // Check if user email and new role are provided
        if (!req.body || !req.body.user_email || !req.body.user_role) {
          return res.status(400).json({ msg: "User email and role are required" });
        }
        
        // Find the user by email first
        userService.SELECT({ user_email_address: req.body.user_email }, (users) => {
          if (!users || users.code || users.length === 0) {
            return res.status(404).json({ msg: "User not found with the provided email" });
          }
          
          const targetUser = users[0];
          console.log(`Found user with email ${req.body.user_email}, ID: ${targetUser.user_id}`);
          
          // Create a user object with the target user ID and new role
          const user = new User(null, null, {
            user_id: targetUser.user_id,
            user_role: req.body.user_role
          });
          
          // Update the user's role
          userService.UPDATE_ROLE(user, (result) => {
            try {
              if (result.code) {
                return res.status(500).json({ 
                  msg: result.message || "Error updating user role"
                });
              }
              
              console.log(`Updated role for user ${targetUser.user_name} (${req.body.user_email}) to ${req.body.user_role}`);
              return res.status(200).json({
                msg: "User role updated successfully"
              });
            } catch (error) {
              console.error("Error updating user role:", error);
              return res.status(500).json({ msg: "Error updating user role" });
            }
          });
        });
      });
    } catch (error) {
      console.error("Unexpected error in update role by email route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  // Direct update endpoint for email-based role changes (admin only)
  app.post("/admin/direct-update-role-by-email", (req, res) => {
    try {
      // Verify admin token
      if (!req.body.admin_token) {
        return res.status(401).json({ msg: "Admin token required" });
      }
      
      let adminId;
      try {
        adminId = jwtDecode(req.body.admin_token).sub;
      } catch (tokenError) {
        return res.status(401).json({ msg: "Invalid admin token" });
      }
      
      // Check if user email and new role are provided
      if (!req.body || !req.body.user_email || !req.body.user_role) {
        return res.status(400).json({ msg: "User email and role are required" });
      }
      
      // Verify the admin has admin role
      userService.SELECT({ user_id: adminId }, (adminUsers) => {
        if (!adminUsers || adminUsers.code || adminUsers.length === 0 || adminUsers[0].user_role !== 1) {
          return res.status(403).json({ msg: "You don't have permission to perform this action" });
        }
        
        // Perform a direct database update
        const userEmail = req.body.user_email;
        const newRole = parseInt(req.body.user_role);
        
        // Update user_table
        pool.query(
          "UPDATE user_table SET user_role = $1 WHERE user_email_address = $2 RETURNING user_id", 
          [newRole, userEmail]
        )
        .then(result => {
          if (result.rows.length === 0) {
            return res.status(404).json({ msg: "User not found with the provided email" });
          }
          
          const userId = result.rows[0].user_id;
          
          // Determine the role string value
          let roleString = 'guest';
          switch(newRole) {
            case 1: roleString = 'admin'; break;
            case 2: roleString = 'teacher'; break;
            case 3: roleString = 'student'; break;
            default: roleString = 'guest';
          }
          
          // Also update user_role_table if it exists
          pool.query(
            "SELECT id FROM user_role_table WHERE user_id = $1", 
            [userId]
          )
          .then(roleResult => {
            if (roleResult.rows.length > 0) {
              // Update existing role entry
              const roleId = roleResult.rows[0].id;
              return pool.query(
                "UPDATE user_role_table SET role = $1, updated_at = NOW() WHERE id = $2",
                [roleString, roleId]
              );
            } else {
              // Create new role entry
              const roleId = uuidv4();
              return pool.query(
                "INSERT INTO user_role_table (id, user_id, role) VALUES ($1, $2, $3)",
                [roleId, userId, roleString]
              );
            }
          })
          .then(() => {
            console.log(`Direct update: Changed role for user with email ${userEmail} to ${newRole} (${roleString})`);
            return res.status(200).json({ 
              msg: "User role updated successfully via direct update",
              user_email: userEmail,
              new_role: newRole,
              role_string: roleString
            });
          })
          .catch(err => {
            console.error("Error updating user_role_table:", err);
            // We already updated the main table, so still return success
            return res.status(207).json({ 
              msg: "User role partially updated (main table only)",
              user_email: userEmail,
              new_role: newRole
            });
          });
        })
        .catch(err => {
          console.error("Error in direct update:", err);
          return res.status(500).json({ msg: "Database error during direct update" });
        });
      });
    } catch (error) {
      console.error("Unexpected error in direct update role route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  // Request role upgrade
  app.post("/user/request-role-upgrade", (req, res) => {
    try {
      // Ensure user is authenticated
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        return res.status(401).json({ msg: "No token provided. Unauthorized access" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ msg: "Invalid token format. Unauthorized access" });
      }
      
      // Get user ID from token
      const userId = jwtDecode(token).sub;
      
      // Check if requested role and reason are provided
      if (!req.body || !req.body.requested_role || !req.body.reason) {
        return res.status(400).json({ msg: "Requested role and reason are required" });
      }
      
      const requestedRole = parseInt(req.body.requested_role);
      
      // Validate the requested role (must be 2 for Teacher or 3 for Student)
      if (requestedRole !== 2 && requestedRole !== 3) {
        return res.status(400).json({ msg: "Invalid role requested. Only Teacher or Student roles can be requested." });
      }
      
      // Get current user information
      userService.SELECT({ user_id: userId }, async (users) => {
        if (!users || users.code || users.length === 0) {
          return res.status(404).json({ msg: "User not found" });
        }
        
        const user = users[0];
        
        // Create a role request entry in the database
        try {
          const roleRequestId = uuidv4();
          const requestStatus = 'pending';
          
          // Map numeric roles to string values for clarity
          const roleNameMap = {
            2: 'Teacher',
            3: 'Student'
          };
            // Store the request in the database
          await pool.query(
            `INSERT INTO role_request_table (
              request_id, user_id, "current_role", requested_role, reason, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [roleRequestId, userId, user.user_role, requestedRole, req.body.reason, requestStatus]
          );
          
          // Notify admins about the new request (can be extended with email notifications)
          try {
            // Find all admin users to notify
            userService.SELECT({ user_role: 1 }, async (adminUsers) => {
              if (adminUsers && adminUsers.length > 0) {
                // For each admin, create a notification
                for (const admin of adminUsers) {
                  const notificationId = uuidv4();
                  await pool.query(
                    `INSERT INTO notification_table (
                      notification_id, user_id, message, type, created_at, is_read
                    ) VALUES ($1, $2, $3, $4, NOW(), false)`,
                    [
                      notificationId, 
                      admin.user_id, 
                      `User ${user.user_name} (${user.user_email_address}) has requested a role change to ${roleNameMap[requestedRole]}.`,
                      'role_request'
                    ]
                  );
                }
              }
            });
          } catch (notificationError) {
            console.error("Error sending admin notifications:", notificationError);
            // Continue anyway - the request is still created
          }
          
          return res.status(200).json({ 
            msg: `Your request to upgrade to ${roleNameMap[requestedRole]} role has been submitted successfully. An administrator will review your request.`,
            requestId: roleRequestId
          });
        } catch (dbError) {
          console.error("Error storing role request:", dbError);
          return res.status(500).json({ msg: "Failed to submit role upgrade request" });
        }
      });
    } catch (error) {
      console.error("Unexpected error in role upgrade request route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  // Admin endpoint to approve/reject role upgrade requests
  app.post("/admin/process-role-request", passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      // Get the admin's user ID from the token
      const adminToken = req.get("Authorization").split(" ")[1];
      const adminId = jwtDecode(adminToken).sub;
      
      // Check if the admin has the admin role (1)
      userService.SELECT({ user_id: adminId }, async (adminUsers) => {
        if (!adminUsers || adminUsers.code || adminUsers.length === 0) {
          return res.status(404).json({ msg: "Admin user not found" });
        }
        
        const admin = adminUsers[0];
        if (admin.user_role !== 1) {
          return res.status(403).json({ msg: "You don't have permission to perform this action" });
        }
        
        // Check if request ID, decision and optional note are provided
        if (!req.body || !req.body.request_id || !req.body.decision) {
          return res.status(400).json({ msg: "Request ID and decision are required" });
        }
        
        const { request_id, decision, admin_note } = req.body;
        
        // Validate decision
        if (decision !== 'approved' && decision !== 'rejected') {
          return res.status(400).json({ msg: "Decision must be either 'approved' or 'rejected'" });
        }
        
        try {
          // First, get the role request details
          const requestResult = await pool.query(
            `SELECT * FROM role_request_table WHERE request_id = $1`,
            [request_id]
          );
          
          if (requestResult.rows.length === 0) {
            return res.status(404).json({ msg: "Role request not found" });
          }
          
          const roleRequest = requestResult.rows[0];
          
          // Update the request status
          await pool.query(
            `UPDATE role_request_table 
             SET status = $1, admin_id = $2, admin_note = $3, updated_at = NOW() 
             WHERE request_id = $4`,
            [decision, adminId, admin_note || null, request_id]
          );
          
          // If approved, update the user's role
          if (decision === 'approved') {
            // Create a user object with the target user ID and new role
            const user = new User(null, null, {
              user_id: roleRequest.user_id,
              user_role: roleRequest.requested_role
            });
            
            // Update the user's role
            userService.UPDATE_ROLE(user, async (result) => {
              if (result.code) {
                return res.status(500).json({ 
                  msg: result.message || "Error updating user role"
                });
              }
              
              // Get user details for notification
              userService.SELECT({ user_id: roleRequest.user_id }, async (users) => {
                if (users && users.length > 0) {
                  const targetUser = users[0];
                  
                  // Create notification for the user
                  try {
                    const notificationId = uuidv4();
                    await pool.query(
                      `INSERT INTO notification_table (
                        notification_id, user_id, message, type, created_at, is_read
                      ) VALUES ($1, $2, $3, $4, NOW(), false)`,
                      [
                        notificationId, 
                        roleRequest.user_id, 
                        `Your request to upgrade your role has been approved. Welcome as a new ${roleRequest.requested_role === 2 ? 'Teacher' : 'Student'}!`,
                        'role_change'
                      ]
                    );
                  } catch (notifyError) {
                    console.error("Error creating user notification:", notifyError);
                    // Continue anyway
                  }
                }
              });
              
              return res.status(200).json({
                msg: `Request approved and user role updated successfully to ${roleRequest.requested_role === 2 ? 'Teacher' : 'Student'}`
              });
            });
          } else {
            // If rejected, just create notification for the user
            try {
              const notificationId = uuidv4();
              await pool.query(
                `INSERT INTO notification_table (
                  notification_id, user_id, message, type, created_at, is_read
                ) VALUES ($1, $2, $3, $4, NOW(), false)`,
                [
                  notificationId, 
                  roleRequest.user_id, 
                  `Your request to upgrade your role has been rejected${admin_note ? ': ' + admin_note : '.'}`,
                  'role_change'
                ]
              );
              
              return res.status(200).json({
                msg: "Request rejected successfully"
              });
            } catch (notifyError) {
              console.error("Error creating user notification:", notifyError);
              return res.status(200).json({
                msg: "Request rejected successfully, but failed to notify user"
              });
            }
          }
        } catch (dbError) {
          console.error("Database error processing role request:", dbError);
          return res.status(500).json({ msg: "Error processing role request" });
        }
      });
    } catch (error) {
      console.error("Unexpected error in process role request route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });
  // Get pending role upgrade requests (for admins)
  app.get("/admin/role-requests", passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      // Get the admin's user ID from the token
      const adminToken = req.get("Authorization").split(" ")[1];
      const adminId = jwtDecode(adminToken).sub;
      
      // Check if the admin has the admin role (1)
      userService.SELECT({ user_id: adminId }, (adminUsers) => {
        if (!adminUsers || adminUsers.code || adminUsers.length === 0) {
          return res.status(404).json({ msg: "Admin user not found" });
        }
        
        const admin = adminUsers[0];
        if (admin.user_role !== 1) {
          return res.status(403).json({ msg: "You don't have permission to perform this action" });
        }
          // Get filter status from query parameters
        const status = req.query.status || 'pending'; // Default to pending
        
        // Use the imported pool directly instead of trying to access it through a different path
        // This is the key fix for the 500 error
        if (!pool) {
          console.error("Database pool is not available");
          return res.status(500).json({ msg: "Database connection error" });
        }
        
        try {
          // Handle 'all' status specially - don't apply a filter
          if (status.toLowerCase() === 'all') {
            pool.query(
              `SELECT rr.*, u.user_name, u.user_email_address
               FROM role_request_table rr
               JOIN user_table u ON rr.user_id = u.user_id
               ORDER BY rr.created_at DESC`,
              (error, result) => {
                if (error) {
                  console.error("Database error fetching role requests:", error);
                  return res.status(500).json({ msg: "Error fetching role requests" });
                }
                
                return res.status(200).json({
                  requests: result.rows
                });
              }
            );
          } else {
            // Get role requests filtered by status
            pool.query(
              `SELECT rr.*, u.user_name, u.user_email_address
               FROM role_request_table rr
               JOIN user_table u ON rr.user_id = u.user_id
               WHERE rr.status = $1
               ORDER BY rr.created_at DESC`,
              [status],
              (error, result) => {
                if (error) {
                  console.error("Database error fetching role requests:", error);
                  return res.status(500).json({ msg: "Error fetching role requests" });
                }
                
                return res.status(200).json({
                  requests: result.rows
                });
              }
            );
          }
        } catch (dbError) {
          console.error("Database error fetching role requests:", dbError);
          return res.status(500).json({ msg: "Error fetching role requests" });
        }
      });
    } catch (error) {
      console.error("Unexpected error in get role requests route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  // Get specific role request by ID (for admins)
  app.get("/admin/role-requests/:requestId", passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      // Get the admin's user ID from the token
      const adminToken = req.get("Authorization").split(" ")[1];
      const adminId = jwtDecode(adminToken).sub;
      
      // Check if the admin has the admin role (1)
      userService.SELECT({ user_id: adminId }, async (adminUsers) => {
        if (!adminUsers || adminUsers.code || adminUsers.length === 0) {
          return res.status(404).json({ msg: "Admin user not found" });
        }
        
        const admin = adminUsers[0];
        if (admin.user_role !== 1) {
          return res.status(403).json({ msg: "You don't have permission to perform this action" });
        }
        
        const requestId = req.params.requestId;
        
        try {
          // Get the specific role request with joined user information
          const result = await pool.query(
            `SELECT rr.*, u.user_name, u.user_email_address
             FROM role_request_table rr
             JOIN user_table u ON rr.user_id = u.user_id
             WHERE rr.request_id = $1`,
            [requestId]
          );
          
          if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Role request not found" });
          }
          
          return res.status(200).json(result.rows[0]);
        } catch (dbError) {
          console.error("Database error fetching specific role request:", dbError);
          return res.status(500).json({ msg: "Error fetching role request" });
        }
      });
    } catch (error) {
      console.error("Unexpected error in get specific role request route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  // Update a specific role request by ID (for admins)
  app.post("/admin/role-requests/:requestId", passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      // Get the admin's user ID from the token
      const adminToken = req.get("Authorization").split(" ")[1];
      const adminId = jwtDecode(adminToken).sub;
      
      // Check if the admin has the admin role (1)
      userService.SELECT({ user_id: adminId }, async (adminUsers) => {
        if (!adminUsers || adminUsers.code || adminUsers.length === 0) {
          return res.status(404).json({ msg: "Admin user not found" });
        }
        
        const admin = adminUsers[0];
        if (admin.user_role !== 1) {
          return res.status(403).json({ msg: "You don't have permission to perform this action" });
        }
        
        const requestId = req.params.requestId;
        
        // Check if status is provided
        if (!req.body || !req.body.status) {
          return res.status(400).json({ msg: "Status is required" });
        }
        
        // Get the status and admin_notes from the request body
        const { status, admin_notes } = req.body;
        
        // Validate status
        if (status !== 'approved' && status !== 'rejected' && status !== 'pending') {
          return res.status(400).json({ msg: "Status must be 'approved', 'rejected', or 'pending'" });
        }
        
        try {
          // Update the request status and admin notes
          const updateResult = await pool.query(
            `UPDATE role_request_table 
             SET status = $1, admin_id = $2, admin_note = $3, updated_at = NOW() 
             WHERE request_id = $4 RETURNING *`,
            [status, adminId, admin_notes || null, requestId]
          );
          
          if (updateResult.rows.length === 0) {
            return res.status(404).json({ msg: "Role request not found" });
          }
          
          const updatedRequest = updateResult.rows[0];
          
          // If status is 'approved', update the user's role
          if (status === 'approved') {
            // Get the user's details from the role request
            const user = new User(null, null, {
              user_id: updatedRequest.user_id,
              user_role: updatedRequest.requested_role
            });
            
            // Update the user's role
            userService.UPDATE_ROLE(user, async (result) => {
              if (result.code) {
                return res.status(500).json({ 
                  msg: result.message || "Error updating user role"
                });
              }
              
              // Create a notification for the user
              try {
                const notificationId = uuidv4();
                await pool.query(
                  `INSERT INTO notification_table (
                    notification_id, user_id, message, type, created_at, is_read
                  ) VALUES ($1, $2, $3, $4, NOW(), false)`,
                  [
                    notificationId, 
                    updatedRequest.user_id, 
                    `Your request to upgrade your role has been approved${admin_notes ? ': ' + admin_notes : '.'}`,
                    'role_change'
                  ]
                );
                
                return res.status(200).json({
                  msg: "Role request approved and user role updated successfully",
                  request: updatedRequest
                });
              } catch (notifyError) {
                console.error("Error creating user notification:", notifyError);
                return res.status(200).json({
                  msg: "Role request approved and user role updated successfully, but failed to notify user",
                  request: updatedRequest
                });
              }
            });
          } else if (status === 'rejected') {
            // Create a notification for the user if request was rejected
            try {
              const notificationId = uuidv4();
              await pool.query(
                `INSERT INTO notification_table (
                  notification_id, user_id, message, type, created_at, is_read
                ) VALUES ($1, $2, $3, $4, NOW(), false)`,
                [
                  notificationId, 
                  updatedRequest.user_id, 
                  `Your request to upgrade your role has been rejected${admin_notes ? ': ' + admin_notes : '.'}`,
                  'role_change'
                ]
              );
              
              return res.status(200).json({
                msg: "Role request rejected successfully",
                request: updatedRequest
              });
            } catch (notifyError) {
              console.error("Error creating user notification:", notifyError);
              return res.status(200).json({
                msg: "Role request rejected successfully, but failed to notify user",
                request: updatedRequest
              });
            }
          } else {
            // If status is 'pending' or something else, just return success
            return res.status(200).json({
              msg: "Role request status updated successfully",
              request: updatedRequest
            });
          }
        } catch (dbError) {
          console.error("Database error updating role request:", dbError);
          return res.status(500).json({ msg: "Error updating role request" });
        }
      });
    } catch (error) {
      console.error("Unexpected error in update role request route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  // Check role request status (for users)
  app.get("/user/role-request-status", (req, res) => {
    try {
      // Ensure user is authenticated
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        return res.status(401).json({ msg: "No token provided. Unauthorized access" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ msg: "Invalid token format. Unauthorized access" });
      }
      
      // Get user ID from token
      const userId = jwtDecode(token).sub;
      
      // Get user's latest role request
      pool.query(
        `SELECT * FROM role_request_table 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId]
      )
      .then(result => {
        if (result.rows.length === 0) {
          return res.status(404).json({ 
            hasRequest: false,
            msg: "No role upgrade requests found" 
          });
        }
        
        const request = result.rows[0];
        return res.status(200).json({
          hasRequest: true,
          request: request
        });
      })
      .catch(err => {
        console.error("Error checking role request status:", err);
        return res.status(500).json({ msg: "Error checking role request status" });
      });
    } catch (error) {
      console.error("Unexpected error in role request status route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  //User connection
  app.post("/user/login", (req, res) => {
    try {
      if (!req.body || !req.body.user_email_address) {
        return res.status(400).json({ msg: "Email address is required" });
      }
      
      let criteria = {
        user_email_address: req.body.user_email_address,
      };
      
      // Create a user object for login attempt tracking
      const userForLock = new User(null, null, {
        user_email_address: req.body.user_email_address
      });
      
      // First try to get the user
      userService.SELECT(criteria, (users) => {
        try {
          if (!users || users.code || users.length === 0) {
            return res.status(401).json({ msg: "Invalid email or password" });
          } 
          
          const user = users[0];
          const hash = user.user_password;
          
          if (!hash) {
            return res.status(500).json({ msg: "User record is invalid" });
          }
          
          // Try to check if account is locked, but continue even if there's an error
          try {
            userService.CHECK_ACCOUNT_LOCK(userForLock, (lockStatus) => {
              // If there was an error checking lock status or account is locked
              if (lockStatus && lockStatus.code) {
                console.warn("Warning: Could not check account lock status:", lockStatus);
                // Continue with login anyway
                processLogin();
              } else if (lockStatus && lockStatus.isLocked) {
                return res.status(429).json({
                  msg: `Too many failed login attempts. Your account is temporarily locked.`,
                  lockedUntil: lockStatus.accountLockedUntil,
                  remainingMinutes: lockStatus.remainingLockTime
                });
              } else {
                // Account is not locked, proceed with login
                processLogin();
              }
            });
          } catch (lockError) {
            console.error("Error checking account lock:", lockError);
            // Continue with login anyway if lock check fails
            processLogin();
          }
          
          // Process the login attempt
          function processLogin() {
            bcrypt
              .compare(req.body.user_password, hash)
              .then(function (result) {
                console.log("Password comparison result:", result);

                if (result) {
                  // Successful login: Try to reset login attempts, but continue even if it fails
                  try {
                    userService.RESET_LOGIN_ATTEMPTS(userForLock, () => {});
                  } catch (resetError) {
                    console.error("Error resetting login attempts:", resetError);
                  }
                  
                  // Check if email is verified
                  if (!user.user_email_verified) {
                    return res.status(403).json({ 
                      msg: "Email not verified. Please verify your email first.",
                      needsVerification: true,
                      email: user.user_email_address
                    });
                  }
                  
                  var jstoken = issueJWTLogin(user);
                  return res.status(200).json({ 
                    jwt: jstoken, 
                    last_session: user.last_session,
                    user_role: user.user_role
                  });
                } else {
                  // Failed login: Try to increment login attempts
                  try {
                    userService.INCREMENT_LOGIN_ATTEMPTS(userForLock, (updatedUser) => {
                      // If we get a valid response with attempts
                      if (updatedUser && updatedUser.login_attempts) {
                        // Check if the account just got locked
                        const isNowLocked = updatedUser.login_attempts >= 5;
                        const attemptsLeft = Math.max(0, 5 - updatedUser.login_attempts);
                        
                        if (isNowLocked) {
                          return res.status(429).json({ 
                            msg: "Too many failed login attempts. Your account is temporarily locked for 15 minutes.",
                            lockedUntil: updatedUser.account_locked_until
                          });
                        } else {
                          return res.status(401).json({ 
                            msg: "Invalid email or password", 
                            attemptsLeft: attemptsLeft
                          });
                        }
                      } else {
                        // If incrementing attempts fails, just return basic error
                        return res.status(401).json({ msg: "Invalid email or password" });
                      }
                    });
                  } catch (incrementError) {
                    console.error("Error incrementing login attempts:", incrementError);
                    // If tracking fails, just return basic error
                    return res.status(401).json({ msg: "Invalid email or password" });
                  }
                }
              })
              .catch((err) => {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ msg: "Error processing login" });
              });
          }
        } catch (usersError) {
          console.error("Error processing user data:", usersError);
          return res.status(500).json({ msg: "Error processing user data" });
        }
      });
    } catch (error) {
      console.error("Unexpected error in login route:", error);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Get current user information
  app.get("/user/me", (req, res) => {
    try {
      // Check if the Authorization header exists
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        return res.status(401).json({ msg: "No token provided. Unauthorized access" });
      }

      // Decode the token from the Authorization header
      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ msg: "Invalid token format. Unauthorized access" });
      }

      let decodedToken;
      try {
        decodedToken = jwtDecode(token);
      } catch (err) {
        return res.status(401).json({ msg: "Invalid token. Unauthorized access" });
      }

      // Check if the user ID exists in the decoded token
      if (!decodedToken.sub) {
        return res.status(401).json({ msg: "Unauthorized access" });
      }

      // Fetch the user based on the decoded user ID
      const criteria = {
        user_id: decodedToken.sub,
      };
      
      userService.SELECT(criteria, (users) => {
        if (!users || users.code || users.length === 0) {
          return res.status(404).json({ msg: "User not found" });
        }
        
        const user = users[0];
        
        // Return user data without password
        const userData = {
          user_id: user.user_id,
          user_name: user.user_name,
          user_email_address: user.user_email_address, 
          user_role: user.user_role,
          last_session: user.last_session,
          user_email_verified: user.user_email_verified,
          is_account_active: user.is_account_active
        };
        
        return res.status(200).json(userData);
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });

  //Update last session
  app.post("/user/last_session", (req, res) => {
    try {
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        return res.status(401).json({ msg: "No token provided. Unauthorized access" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ msg: "Invalid token format. Unauthorized access" });
      }
      
      let user = {
        last_session: req.body.session,
        user_id: jwtDecode(token).sub,
      };
      
      userService.UPDATE_last_session(user, (result) => {
        try {
          if (result.code) {
            return res.status(result.code).json({ msg: result.errorMessage || "Update failed" });
          } else {
            return res.status(200).json({ msg: "Session updated successfully" });
          }
        } catch (updateError) {
          console.error("Error processing update result:", updateError);
          return res.status(500).json({ msg: "Error updating session" });
        }
      });
    } catch (error) {
      console.error("Unexpected error in last_session route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  // Request password reset (send email with reset link)
  app.post("/user/reset-password", async (req, res) => {
    try {
      // Check if email is provided
      if (!req.body || !req.body.user_email_address) {
        return res.status(400).json({ 
          success: false, 
          msg: "Email address is required" 
        });
      }

      const userEmail = req.body.user_email_address;
      
      // Create a promise-based version of userService.SELECT
      const getUserByEmail = () => {
        return new Promise((resolve, reject) => {
          userService.SELECT({ user_email_address: userEmail }, (users) => {
            if (!users || users.code) {
              reject(new Error('Failed to query user'));
            } else {
              resolve(users);
            }
          });
        });
      };
      
      // Get user asynchronously
      const users = await getUserByEmail();
      
      if (!users || users.length === 0) {
        return res.status(404).json({ 
          success: false, 
          msg: "No account found with this email address" 
        });
      }
      
      const user = users[0];
      
      // Generate a 6-digit OTP code for password reset
      const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit number
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 1); // Token valid for 1 hour
      
      // Store the token in the database
      try {
        await pool.query(
          `UPDATE user_table 
           SET otp_code = $1, otp_expiry = $2 
           WHERE user_email_address = $3`,
          [resetToken, expiryTime, userEmail]
        );
        
        // Use Brevo API to send password reset email
        const fromEmail = 'chandrayee.cse@gmail.com'; // Replace with your verified email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
        
        // Create the email content
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4f46e5;">SyntaxMap</h2>
            <p>Hello ${user.user_name || ''},</p>
            <p>We received a request to reset your password. Click the button below to create a new password. This link is valid for 1 hour.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>– SyntaxMap Team</p>
          </div>
        `;
        
        const textContent = `Hello ${user.user_name || ''},\n\nWe received a request to reset your password. Please visit the following link to create a new password:\n\n${resetLink}\n\nThis link is valid for 1 hour.\n\nIf you did not request a password reset, please ignore this email or contact support if you have concerns.\n\n– SyntaxMap Team`;
        
        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        
        sendSmtpEmail = {
          sender: { email: fromEmail, name: 'SyntaxMap' },
          to: [{ email: userEmail }],
          subject: 'Reset Your SyntaxMap Password',
          htmlContent: htmlContent,
          textContent: textContent
        };
        
        console.log('Sending password reset email...');
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email API response:', JSON.stringify(response));
        
        return res.status(200).json({ 
          success: true, 
          msg: "Password reset link has been sent to your email address" 
        });
      } catch (error) {
        console.error('Error sending password reset email:', error);
        return res.status(500).json({ 
          success: false, 
          msg: "Failed to send password reset email. Please try again later." 
        });
      }
    } catch (error) {
      console.error("Unexpected error in reset-password route:", error);
      return res.status(500).json({ 
        success: false, 
        msg: "Internal server error" 
      });
    }
  });

  // Reset password with token
  app.post("/user/resetpassword", async (req, res) => {
    try {
      // Check if token and password are provided
      if (!req.body || !req.body.token || !req.body.user_password) {
        return res.status(400).json({ 
          success: false, 
          msg: "Token and new password are required" 
        });
      }

      const { token, user_password } = req.body;
      
      // Find user with this token and check if it's not expired
      const result = await pool.query(
        `SELECT * FROM user_table 
         WHERE otp_code = $1 AND otp_expiry > NOW()`,
        [token]
      );
      
      if (result.rows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          msg: "Invalid or expired token. Please request a new password reset link." 
        });
      }
      
      const user = result.rows[0];
      
      // Hash the new password
      const hashedPassword = bcrypt.hashSync(user_password, 10);
      
      // Update the user's password and clear the reset token
      await pool.query(
        `UPDATE user_table 
         SET user_password = $1, otp_code = NULL, otp_expiry = NULL 
         WHERE user_id = $2`,
        [hashedPassword, user.user_id]
      );
      
      return res.status(200).json({ 
        success: true, 
        msg: "Password has been reset successfully. You can now login with your new password." 
      });
    } catch (error) {
      console.error("Unexpected error in resetpassword route:", error);
      return res.status(500).json({ 
        success: false, 
        msg: "Internal server error" 
      });
    }
  });

  // Direct update of a specific role request by ID (for admins)
  app.post("/admin/role-requests/:requestId", passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      // Get the admin's user ID from the token
      const adminToken = req.get("Authorization").split(" ")[1];
      const adminId = jwtDecode(adminToken).sub;
      
      // Check if the admin has the admin role (1)
      userService.SELECT({ user_id: adminId }, async (adminUsers) => {
        if (!adminUsers || adminUsers.code || adminUsers.length === 0) {
          return res.status(404).json({ msg: "Admin user not found" });
        }
        
        const admin = adminUsers[0];
        if (admin.user_role !== 1) {
          return res.status(403).json({ msg: "You don't have permission to perform this action" });
        }
        
        const requestId = req.params.requestId;
        
        // Check if status and optional admin_notes are provided
        if (!req.body || !req.body.status) {
          return res.status(400).json({ msg: "Status is required" });
        }
        
        const { status, admin_notes } = req.body;
        
        // Validate status
        if (status !== 'approved' && status !== 'rejected') {
          return res.status(400).json({ msg: "Status must be either 'approved' or 'rejected'" });
        }
        
        try {
          // First, get the role request details
          const requestResult = await pool.query(
            `SELECT * FROM role_request_table WHERE request_id = $1`,
            [requestId]
          );
          
          if (requestResult.rows.length === 0) {
            return res.status(404).json({ msg: "Role request not found" });
          }
          
          const roleRequest = requestResult.rows[0];
          
          // Update the request status
          await pool.query(
            `UPDATE role_request_table 
             SET status = $1, admin_id = $2, admin_note = $3, updated_at = NOW() 
             WHERE request_id = $4`,
            [status, adminId, admin_notes || null, requestId]
          );
          
          // If approved, update the user's role
          if (status === 'approved') {
            const requestedRole = roleRequest.requested_role;
            
            await pool.query(
              "UPDATE user_table SET user_role = $1 WHERE user_id = $2", 
              [requestedRole, roleRequest.user_id]
            );
            
            // Notify the user about the approval
            try {
              const notificationId = uuidv4();
              await pool.query(
                `INSERT INTO notification_table (
                  notification_id, user_id, message, type, created_at, is_read
                ) VALUES ($1, $2, $3, $4, NOW(), false)`,
                [
                  notificationId, 
                  roleRequest.user_id, 
                  `Your request to upgrade your role has been approved. Welcome as a new ${roleRequest.requested_role === 2 ? 'Teacher' : 'Student'}!`,
                  'role_change'
                ]
              );
            } catch (notifyError) {
              console.error("Error creating user notification:", notifyError);
              // Continue anyway
            }
            
            return res.status(200).json({
              msg: `Request approved and user role updated successfully to ${roleRequest.requested_role === 2 ? 'Teacher' : 'Student'}`
            });
          } else {
            // If rejected, create notification for the user
            try {
              const notificationId = uuidv4();
              await pool.query(
                `INSERT INTO notification_table (
                  notification_id, user_id, message, type, created_at, is_read
                ) VALUES ($1, $2, $3, $4, NOW(), false)`,
                [
                  notificationId, 
                  roleRequest.user_id, 
                  `Your request to upgrade your role has been rejected${admin_notes ? ': ' + admin_notes : '.'}`,
                  'role_change'
                ]
              );
            } catch (notifyError) {
              console.error("Error creating user notification:", notifyError);
              // Continue anyway
            }
            
            return res.status(200).json({
              msg: "Request rejected successfully"
            });
          }
        } catch (dbError) {
          console.error("Database error updating role request:", dbError);
          return res.status(500).json({ msg: "Error updating role request" });
        }
      });
    } catch (error) {
      console.error("Unexpected error in update specific role request route:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });
};
