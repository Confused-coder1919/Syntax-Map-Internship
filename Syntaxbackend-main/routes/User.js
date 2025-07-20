require('dotenv').config()

const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db_connect.js');

//Get all users
router.get('/user', (req, res) =>{
	pool.query('select * from user_table')
	.then(result => {
		console.log(result.rows);
		res.send(result.rows);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//Get a user from its name
router.get('/user/:name', (req, res) =>{
	pool.query('select * from user_table where user_name = \'' + req.params.name + '\'')
	.then(result => {
		console.log(result.rows);
		res.send(result.rows);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//Connect to the app
router.post('/user/login', (req, res) => {
    console.log("Login attempt received:", { 
        email: req.body.user_email_address,
        passwordProvided: !!req.body.user_password,
        requestBody: req.body
    });

    // Extract credentials from request body
    const { user_email_address, user_password } = req.body;

    // Check if email and password were provided
    if (!user_email_address || !user_password) {
        console.log("Login failed: Missing email or password");
        return res.status(400).json({ msg: 'Email and password are required' });
    }

    // Use parameterized query to prevent SQL injection
    pool.query('SELECT * FROM user_table WHERE user_email_address = $1', [user_email_address])
    .then(result => {
        if (result.rows.length === 0) {
            console.log(`Login failed: No user found with email ${user_email_address}`);
            return res.status(401).json({ msg: 'Invalid email or password' });
        }

        const user = result.rows[0];
        const hash = user.user_password;
        
        console.log("Password check:", {
            userFound: true,
            emailMatches: user.user_email_address === user_email_address,
            hashedPasswordLength: hash ? hash.length : 0,
            plainPasswordLength: user_password.length,
            role: user.user_role,
            emailVerified: user.user_email_verified
        });
            
        // User data to include in token
        const userData = {
            user_id: user.user_id,
            user_name: user.user_name,
            user_email_address: user.user_email_address,
            user_role: user.user_role || 'user' // Default to 'user' if role is not set
        };

        // Compare password
        bcrypt.compare(user_password, hash)
        .then(isMatch => {
            console.log("Password comparison result:", { 
                isMatch: isMatch,
                passwordMatches: isMatch
            });

            if (!isMatch) {
                console.log(`Login failed: Password mismatch for ${user_email_address}`);
                return res.status(401).json({ msg: 'Invalid email or password' });
            }

            // Check if email verification is required
            if (user.user_email_verified === false) {
                console.log(`Login requires verification: ${user_email_address}`);
                return res.status(200).json({ 
                    needsVerification: true,
                    email: user_email_address,
                    msg: 'Email verification required'
                });
            }

            try {
                // Generate tokens with proper expiresIn
                const token = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.EXPIRE_TIME_TOKEN || '1h' });
                const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

                console.log(`Login successful: Generated token for ${user_email_address}`);

                // Update tokens in database
                pool.query(
                    'UPDATE user_table SET user_jstoken = $1, user_jstoken_refresh = $2 WHERE user_email_address = $3',
                    [token, refreshToken, user_email_address]
                )
                .then(() => {
                    // Send successful response with tokens
                    res.status(200).json({
                        jwt: { token, refreshToken },
                        user_id: user.user_id,
                        user_name: user.user_name,
                        user_email_address: user.user_email_address,
                        user_role: userData.user_role,
                        last_session: user.last_session || null
                    });
                })
                .catch(err => {
                    console.error('Database error updating tokens:', err);
                    // Still return the tokens even if DB update fails
                    res.status(200).json({
                        jwt: { token, refreshToken },
                        user_id: user.user_id, 
                        user_name: user.user_name,
                        user_email_address: user.user_email_address,
                        user_role: userData.user_role,
                        last_session: user.last_session || null
                    });
                });
            } catch (err) {
                console.error('JWT signing error:', err);
                res.status(500).json({ msg: 'Error generating authentication token' });
            }
        })
        .catch(err => {
            console.error('Password comparison error:', err);
            res.status(500).json({ msg: 'Server error during login' });
        });
    })
    .catch(err => {
        console.error('Database error during login:', err);
        res.status(500).json({ msg: 'Server error during login' });
    });
});

// Get user role from token
router.post('/user/role', (req, res) => {
    try {
        // Get token from Authorization header or request body
        const token = req.headers.authorization || req.body.token;
        
        if (!token) {
            console.log('Role check failed: No token provided');
            return res.status(401).json({ msg: 'No token provided' });
        }
        
        // Verify token validity with fallback secret
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'fallback_secret_key', (err, decoded) => {
            if (err) {
                console.error('Token verification error:', err.message);
                return res.status(401).json({ msg: 'Invalid token', error: err.message });
            }
            
            // If we don't have user_email_address in decoded token
            if (!decoded || !decoded.user_email_address) {
                console.error('Invalid token payload:', decoded);
                return res.status(401).json({ msg: 'Invalid token format' });
            }
            
            console.log('Role check: Verified token for user', decoded.user_email_address);
            
            // If token is valid but we need to double-check with database
            pool.query('SELECT user_role FROM user_table WHERE user_email_address = $1', [decoded.user_email_address])
            .then(result => {
                if (result.rows.length) {
                    const role = result.rows[0].user_role || 'user';
                    console.log(`Role check result: User ${decoded.user_email_address} has role ${role}`);
                    res.status(200).json({ role });
                } else {
                    console.log(`Role check failed: User ${decoded.user_email_address} not found in database`);
                    res.status(404).json({ msg: 'User not found' });
                }
            })
            .catch(err => {
                console.error('Database error in role verification:', err);
                
                // Fallback to role in JWT if database query fails
                if (decoded.user_role) {
                    console.log(`Role check fallback: Using JWT role ${decoded.user_role} due to DB error`);
                    res.status(200).json({ role: decoded.user_role });
                } else {
                    res.status(500).json({ msg: 'Server error verifying role' });
                }
            });
        });
    } catch (error) {
        console.error('Error in role verification:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

//Create a User
router.post('/user', (req, res) =>{
	//hash password
	bcrypt.hash(req.body.user_password, 10, function(err, hash) {
		//request sql
		pool.query('insert into user_table values (\'' + req.body.user_email_address + '\',\'' + hash + '\',DEFAULT,\'' + req.body.user_name + '\')')
		.then(result => {
			console.log(result);
			//nodemail ou sendgrid

			res.send(result);
		})
		.catch(err => {
			console.log(err);
			//callback(null);
		});
	});
});

//Modify a user from its id
router.put('/user/:id', (req, res)=>{
	pool.query('update user_table set user_name = \'' + req.body.user_name + '\',	user_gender = \'' + req.body.user_gender + '\', user_address = \'' + req.body.user_address + '\', user_password = \'' + req.body.user_password + '\', user_mobile_no = \'' + req.body.user_mobile_no + '\', user_email_address = \'' + req.body.user_email_address + '\', user_email_verified = \'' + req.body.user_email_verified + '\', user_verification_code = \'' + req.body.user_verification_code + '\', user_jstoken = \'' + req.body.user_jstoken + '\', user_jstoken_refresh =\'' + req.body.user_jstoken_refresh + '\', user_role = ' + req.body.user_role + ' where user_id = ' + req.params.id)
	.then(result => {
		console.log(result);
		res.send(result);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//Delete a User from its id
router.delete('/user/:id', (req, res)=>{
	pool.query('delete from user_table where user_id = ' + req.params.id)
	.then(result => {
		console.log(result);
		res.send(result);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

module.exports = router