const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const imageUploadDir = path.join(__dirname, '..', 'uploads', 'images');

// Create directories if they don't exist
if (!fs.existsSync(imageUploadDir)){
    fs.mkdirSync(imageUploadDir, { recursive: true });
    console.log('Created upload directory:', imageUploadDir);
}

// Define storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageUploadDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// Create a multer configuration that handles any field name
// This is a more permissive approach that accepts files regardless of field name
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Log the file being uploaded to help debug
        console.log('Multer processing file:', file.fieldname);
        // Accept all files
        cb(null, true);
    }
});

// Export different middleware configurations
module.exports = {
    // For single file uploads - will accept any field name
    single: () => upload.single('file'), 
    
    // For a specific field name
    singleWithField: (fieldName) => upload.single(fieldName),
    
    // For multiple files with same field name
    array: (fieldName, maxCount) => upload.array(fieldName, maxCount),
    
    // For multiple files with different field names
    fields: (fields) => upload.fields(fields),
    
    // For handling any fields (most permissive)
    any: () => upload.any()
};