const express = require("express");
const router = express.Router();
const getSyntaxe = require("../parser/syntaxePostgres.js");
const pool = require('../config/db_connect.js');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require('jsonwebtoken');

// Import multer configuration (assuming it exists in the config folder)
const uploadConfig = require('../config/multerConfig');
const upload = uploadConfig.userImageUpload;

// Middleware to verify JWT and check user role
const verifyTokenAndRole = (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(403).json({ error: "Failed to authenticate token" });
      }
      
      console.log("⭐ Token data:", JSON.stringify(decoded));
      
      // Check if user has appropriate role (3 = Student)
      const userRole = decoded.authorization;
      if (userRole !== 3) {
        return res.status(403).json({ error: "Access denied. Student role required." });
      }
      
      // Add user data to request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all uploads (restricted to admins in other routes)
router.get('/userupload', verifyTokenAndRole, (req, res) => {
  const userId = req.user.sub; // Get user ID from token
  
  // Students can only view their own uploads
  const query = 'SELECT * FROM user_upload WHERE user_id = $1';
  
  pool.query(query, [userId])
    .then(result => {
      console.log(`Found ${result.rows.length} uploads for user ${userId}`);
      res.status(200).json(result.rows);
    })
    .catch(err => {
      console.error("Error fetching uploads:", err);
      res.status(500).json({ error: "Database error" });
    });
});

// Get upload by ID (for a specific student)
router.get('/userupload/:id', verifyTokenAndRole, (req, res) => {
  const userId = req.user.sub; // Get user ID from token
  const uploadId = req.params.id;
  
  // Students can only view their own uploads
  const query = 'SELECT * FROM user_upload WHERE id_upload = $1 AND user_id = $2';
  
  pool.query(query, [uploadId, userId])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Upload not found or access denied" });
      }
      res.status(200).json(result.rows[0]);
    })
    .catch(err => {
      console.error("Error fetching upload:", err);
      res.status(500).json({ error: "Database error" });
    });
});

// Create new upload with image
router.post('/userupload', verifyTokenAndRole, upload.single('image'), (req, res) => {
  try {
    console.log("Upload request body:", req.body);
    console.log("Upload request files:", req.files);
    
    const userId = req.user.sub; // Get user ID from token
    let imagePath = null;
    
    // Check if an image was uploaded
    if (req.file) {
      // Use relative path for storing in database
      imagePath = `/uploads/images/${req.file.filename}`;
      console.log("Upload data with image path:", {
        sentence: req.body.sentence,
        user_id: userId,
        img: imagePath
      });
    }
    
    // Use parameterized query to prevent SQL injection
    const query = `INSERT INTO user_upload(sentence, image_path, user_id, course_id) 
                  VALUES ($1, $2, $3, $4) RETURNING id_upload, image_path`;
    
    const courseId = req.body.course_id || null;
    const sentence = getSyntaxe(req.body.sentence || "");
    
    pool.query(query, [sentence, imagePath, userId, courseId])
      .then(result => {
        console.log("Insert result:", result.rows[0]);
        res.status(201).json({
          message: "Upload created successfully",
          upload_id: result.rows[0].id_upload,
          image_path: result.rows[0].image_path
        });
      })
      .catch(err => {
        console.error("Error creating upload:", err);
        res.status(500).json({ error: "Database error", details: err.message });
      });
  } catch (error) {
    console.error("Error in upload process:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Update an upload
router.put('/userupload/:id', verifyTokenAndRole, (req, res) => {
  const userId = req.user.sub; // Get user ID from token
  const uploadId = req.params.id;
  
  // Check if the upload belongs to this user first
  pool.query('SELECT * FROM user_upload WHERE id_upload = $1 AND user_id = $2', [uploadId, userId])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(403).json({ error: "Access denied or upload not found" });
      }
      
      // Proceed with update
      const sentence = getSyntaxe(req.body.sentence || result.rows[0].sentence);
      const query = 'UPDATE user_upload SET sentence = $1 WHERE id_upload = $2 AND user_id = $3 RETURNING *';
      
      return pool.query(query, [sentence, uploadId, userId]);
    })
    .then(updateResult => {
      if (!updateResult) return; // Already handled by error above
      console.log("Update result:", updateResult.rows[0]);
      res.status(200).json({
        message: "Upload updated successfully",
        upload: updateResult.rows[0]
      });
    })
    .catch(err => {
      console.error("Error updating upload:", err);
      res.status(500).json({ error: "Database error" });
    });
});

// Delete an upload
router.delete('/userupload/:id', verifyTokenAndRole, (req, res) => {
  const userId = req.user.sub; // Get user ID from token
  const uploadId = req.params.id;
  
  // Students can only delete their own uploads
  const query = 'DELETE FROM user_upload WHERE id_upload = $1 AND user_id = $2 RETURNING id_upload';
  
  pool.query(query, [uploadId, userId])
    .then(result => {
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Upload not found or access denied" });
      }
      res.status(200).json({ message: "Upload deleted successfully", id: uploadId });
    })
    .catch(err => {
      console.error("Error deleting upload:", err);
      res.status(500).json({ error: "Database error" });
    });
});

module.exports = router;