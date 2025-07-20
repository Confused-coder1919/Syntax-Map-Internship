// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import user ressources
const UserUpload = require('./UserUpload.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js')

// import syntaxe
const getSyntaxe = require("../../parser/syntaxePostgres.js")

class UserUploadDao extends InterfaceDao {

	constructor () {
		super()
	}

	// USER UPLOAD DAO : Public methods

	INSERT (upload, callback) {
		console.log('USER_UPLOAD_DAO')
		console.log('User ID:', upload.user_id);
		console.log('Image path:', upload.img);
		console.log('Tense ID:', upload.tense_id);
		
			// Use parameterized query for better security
		const values = [
			getSyntaxe(upload.sentence), 
			upload.img, 
			upload.user_id,
			upload.tense_id
		];
		
		const qtext = `
			INSERT INTO user_upload(sentence, image_path, user_id, tense_id) 
			VALUES ($1, $2, $3, $4) 
			RETURNING id_upload, image_path`;
			
		console.log('SQL Query:', qtext)
		
		pool.query(qtext, values)
			.then(res => {
				console.log('Database response:', res.rows[0]);
				// Set the upload_id and ensure img is correctly set from the database response
				upload.upload_id = res.rows[0].id_upload;
				if (res.rows[0].image_path) {
					upload.img = res.rows[0].image_path;
				}
				console.log('Returning upload object with ID:', upload.upload_id, 'and img:', upload.img);
				callback(upload);
			})
			.catch(err => {
				console.error('Error during INSERT:', err);
				this.ErrorHandling(err, callback);
			});
	}

	UPDATE (upload, callback) {
		const uploadId = upload.upload_id;
		const values = [
			getSyntaxe(upload.sentence), 
			upload.img, 
			upload.user_id, 
			upload.tense_id,
			uploadId
		];
		
		const qtext = `
			UPDATE user_upload 
			SET sentence = $1, 
				image_path = $2, 
				user_id = $3,
				tense_id = $4 
			WHERE id_upload = $5
			RETURNING *`;
		
		console.log('UPDATE query:', qtext)
		
		pool.query(qtext, values)
			.then(res => {
				console.log('UPDATE result:', res);
				if (res.rowCount === 0) {
					this.ErrorHandling({
						'code': '_1',
						'errorMessage': 'Upload not found or not authorized to update',
						'id': uploadId
					}, callback);
				} else {
					callback(upload);
				}
			})
			.catch(err => {
				console.error('Error in UPDATE operation:', err);
				this.ErrorHandling(err, callback);
			});
	}

	SELECT (criteria, callback) {
		let queryParts = [
			'SELECT user_upload.id_upload as id_upload, user_upload.sentence as sentence, user_upload.image_path as img, user_upload.user_id as user_id, user_upload.tense_id as tense_id, user_upload.created_at FROM user_upload'
		];
		let whereConditions = [];
		let queryParams = [];
		let paramCounter = 1;
		
		if (criteria.sentence) {
			whereConditions.push(`sentence = $${paramCounter++}`);
			queryParams.push(criteria.sentence);
		}
		
		if (criteria.img) {
			whereConditions.push(`image_path = $${paramCounter++}`);
			queryParams.push(criteria.img);
		}
		
		if (criteria.user_id) {
			whereConditions.push(`user_id = $${paramCounter++}`);
			queryParams.push(criteria.user_id.toString());
		}
		
		if (criteria.upload_id) {
			whereConditions.push(`id_upload = $${paramCounter++}`);
			queryParams.push(criteria.upload_id.toString());
		}
		
		if (criteria.tense_id) {
			whereConditions.push(`tense_id = $${paramCounter++}`);
			queryParams.push(criteria.tense_id.toString());
		}
		
		if (whereConditions.length > 0) {
			queryParts.push('WHERE ' + whereConditions.join(' AND '));
		}
		
		// Add sorting to ensure consistent results
		queryParts.push('ORDER BY created_at DESC');
		
		const qtext = queryParts.join(' ');
		console.log('SELECT query:', qtext);
		console.log('SELECT params:', queryParams);
		
		pool.query(qtext, queryParams)
			.then(res => {
				console.log(`SELECT results: Found ${res.rows.length} records`);
				let uploads = [];
				res.rows.forEach(item => {
					// Create UserUpload object
					const upload = new UserUpload(null, item, null);
					uploads.push(upload);
				});
				callback(uploads);
			})
			.catch(err => {
				console.error('Error in SELECT:', err);
				this.ErrorHandling(err, callback);
			});
	}

	DELETE (upload, callback) {
		console.log('DELETE operation called with:', upload);
		
			// Validate the upload_id is a number, which is required for our SERIAL PRIMARY KEY
		if (!upload.upload_id || isNaN(parseInt(upload.upload_id))) {
			console.error('Invalid upload_id format. Expected a number but got:', upload.upload_id);
			return this.ErrorHandling({
				'code': '400',
				'errorMessage': 'Invalid upload ID format. Expected a number.',
				'id': upload.upload_id
			}, callback);
		}
		
		// Convert to integer since database expects an integer for id_upload
		const id_upload = parseInt(upload.upload_id);
		
		// Include user_id in the query for security to ensure users can only delete their own uploads
		const qtext = 'DELETE FROM user_upload WHERE id_upload = $1 AND user_id = $2';
		const values = [id_upload, upload.user_id];
		
		console.log('DELETE query values:', values);
		console.log('DELETE query id_upload type:', typeof id_upload, 'value:', id_upload);
		
		pool.query(qtext, values)
			.then(res => {
				console.log('DELETE query result:', res);
				if (res.rowCount === 0) {
					console.log('No rows deleted, sending error');
					this.ErrorHandling({
						'code': '_1',
						'errorMessage': 'Upload not found or not authorized to delete',
						'id': upload.upload_id
					}, callback);
				} else {
					console.log('Successfully deleted upload with ID:', upload.upload_id);
					callback(res);
				}
			})
			.catch(err => {
				console.error('Error in DELETE operation:', err);
				this.ErrorHandling(err, callback);
			});
	}

	// USER UPLOAD DAO : private methods

}

module.exports = UserUploadDao;
