// import userUpload ressources
const UserUpload = require('../modules/Ressources.UserUpload/UserUpload.js');
const UserUploadService = require('../modules/Ressources.UserUpload/UserUploadService.js');

// import decoder jwt
const jwtDecode = require("jwt-decode");
// import passport
const passport = require('passport');

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

// Use the centralized multer configuration instead of local configuration
const multerConfig = require('../config/multerConfig.js');

module.exports = (app) => {
	
var userUploadService = new UserUploadService();

	//Get Every exemple
	app.get('/userupload', passport.authenticate('user_connected', { session: false }), (req, res) =>{
		userUploadService.SELECT({},(userUploads) => {
			if (userUploads.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				const token = jwtDecode(req.get('Authorization').split(' ')[1]);
				if (token.authorization === 1) // Check if user is admin (role 1)
					userUploads.forEach(item => { results.push(item.toObject(true, true, true));})
				else
					userUploads.forEach(item => { results.push(item.toObject(false, false, false));})
				res.status(200).json({'userUploads': results});
			}
		})
	});
	
	//User get his exemple
	app.get('/userupload/user/:tense', passport.authenticate('user_connected', { session: false }), (req, res) =>{
		let criteria = {
				tense_id: req.params.tense,
				user_id:  jwtDecode(req.get('Authorization').split(' ')[1]).sub
		};
		userUploadService.SELECT(criteria,(userUploads) => {
			if (userUploads.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				userUploads.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'userUploads': results});
			}
		})
	});
	
	//User get all his uploads without specifying a course
	app.get('/userupload/user', passport.authenticate('user_connected', { session: false }), (req, res) =>{
		let criteria = {
			user_id: jwtDecode(req.get('Authorization').split(' ')[1]).sub
		};
		console.log('Fetching uploads for user:', criteria.user_id);
		userUploadService.SELECT(criteria,(userUploads) => {
			if (userUploads.code) {
				console.log('Error fetching uploads:', userUploads);
				res.status(406).end();
				return;
			} else {
				console.log('Found uploads:', userUploads);
				let results = [];
				userUploads.forEach(item => { 
					const obj = item.toObject(true, true, true);
					console.log('Processing upload item:', obj);
					results.push(obj);
				});
				console.log('Returning results:', results);
				res.status(200).json({'userUploads': results});
			}
		});
	});

	//User upload an new exemple - Using the more permissive multer.any() to accept any field name
	app.post('/userupload', passport.authenticate('user_connected', { session: false }), 
	    multerConfig.any(), // Use the any() method to accept files with any field name
	    (req, res) => {
        console.log('Upload request body:', req.body);
        console.log('Upload request files:', req.files);
        
	    console.log(req.get('Authorization').split(' ')[1]);
		req.body.user_id = jwtDecode(req.get('Authorization').split(' ')[1]).sub;
		console.log(req.body.user_id);
		
		// Create a new body object with the image path included
		const uploadData = {
            ...req.body,
            // Save the relative path to the uploaded image if available
            img: req.files && req.files.length > 0 ? '/uploads/images/' + req.files[0].filename : null
        };
        
        console.log('Upload data with image path:', uploadData);
		
		let bodyNewUserUpload = new UserUpload(null, null, uploadData);
		console.log('UserUpload object created with image path:', bodyNewUserUpload.img);
		
		userUploadService.INSERT(bodyNewUserUpload, (newUserUpload) => {
			console.log('Insert result:', newUserUpload);
			if (newUserUpload.code) {
				res.statusMessage = newUserUpload.errorMessage;
				res.status(newUserUpload.code).end();
				return;
			} else {
				 // Return both the ID and image path in the response
				res.status(200).json({ 
					upload_id: newUserUpload.upload_id,
					img: newUserUpload.img
				});
			}
		});
	});
	
	//Delete user upload by ID
	app.delete('/userupload/:id', passport.authenticate('user_connected', { session: false }), (req, res) => {
		console.log('DELETE request received for upload ID:', req.params.id);
		
		try {
			// Get user ID from token to ensure they can only delete their own uploads
			const userId = jwtDecode(req.get('Authorization').split(' ')[1]).sub;
			const uploadId = req.params.id;
			
			 // Validate that the ID parameter is a number
			if (!uploadId || isNaN(parseInt(uploadId))) {
				console.error('Invalid upload ID format:', uploadId);
				return res.status(400).json({ 
					error: 'Invalid upload ID format. Expected a number.',
					id: uploadId
				});
			}
			
			// Create upload object with the ID and user ID for security
			const upload = {
				upload_id: uploadId,
				user_id: userId
			};
			
			console.log('Calling DELETE service with upload object:', upload);
			userUploadService.DELETE(upload, (result) => {
				console.log('DELETE service response:', result);
				
				if (result && result.code) {
					console.log('Error occurred:', result.code, result.errorMessage);
					res.statusMessage = result.errorMessage;
					res.status(result.code).end();
				} else if (result && result.rowCount === 0) {
					console.log('No records found to delete');
					res.status(404).json({ 
						error: 'No upload found with that ID',
						id: uploadId
					});
				} else {
					console.log('DELETE successful');
					res.status(200).json({ 
						message: 'Upload deleted successfully',
						id: uploadId
					});
				}
			});
		} catch (error) {
			console.error('Error in DELETE route handler:', error);
			res.status(500).json({ 
				error: 'Internal server error',
				message: error.message
			});
		}
	});
}