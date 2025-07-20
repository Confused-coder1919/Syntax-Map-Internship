// import dictionnary ressources
const Dictionnary = require('../modules/Ressources.Dictionnary/Dictionnary.js');
const DictionnaryService = require('../modules/Ressources.Dictionnary/DictionnaryService.js');

// import postgresql client
const pool = require('../config/db_connect');

// import decoder jwt
const jwtDecode = require("jwt-decode");

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

module.exports = (app) => {
	
var dictionnaryService = new DictionnaryService();

	//Get all dictionnary
	app.get('/dictionnary', (req, res) => {
		dictionnaryService.SELECT({}, (dictionnarys) => {
			// Check if there's an error
			if (dictionnarys && dictionnarys.code) {
				if (!res.headersSent) {
					res.status(dictionnarys.code || 406).json({
						error: true,
						message: dictionnarys.errorMessage || 'An error occurred while retrieving dictionary data'
					});
				}
				return;
			} 
			
			// Process valid response
			if (Array.isArray(dictionnarys)) {
				let results = [];
				dictionnarys.forEach(item => { 
					results.push(item.toObject(true, true, true));
				});
				
				if (!res.headersSent) {
					res.status(200).json({'dictionnary': results});
				}
			} else {
				// Handle unexpected response format
				if (!res.headersSent) {
					res.status(500).json({
						error: true, 
						message: 'Unexpected response format from dictionary service'
					});
				}
			}
		});
	});

	//Get a dictionnary from its user
	app.get('/dictionnary/user', (req, res) => {
		try {
			// Get user ID from token
			const token = req.get('Authorization');
			if (!token) {
				return res.status(401).json({ error: true, message: 'Unauthorized: No token provided' });
			}
			
			let userId;
			try {
				const tokenPayload = token.split(' ')[1];
				if (!tokenPayload) {
					throw new Error('Invalid token format');
				}
				userId = jwtDecode(tokenPayload).sub.toString();
			} catch (tokenError) {
				return res.status(401).json({ error: true, message: 'Invalid or expired token' });
			}
			
			console.log('User ID parsed from token:', userId);
			
			let criteria = {
				user_id: userId
			};
			
			dictionnaryService.SELECT(criteria, (dictionnarys) => {
				// Check if the response is an error object
				if (dictionnarys && dictionnarys.code) {
					// If a response hasn't been sent yet, send an error response
					if (!res.headersSent) {
						res.status(dictionnarys.code || 406).json({
							error: true,
							message: dictionnarys.errorMessage || 'An error occurred while retrieving dictionary data'
						});
					}
					return;
				} 
				
				// Process valid response
				if (Array.isArray(dictionnarys)) {
					let results = [];
					dictionnarys.forEach(item => { 
						results.push(item.toObject(true, true, true));
					});
					
					if (!res.headersSent) {
						res.status(200).json({'dictionnary': results});
					}
				} else {
					// Handle unexpected response format
					if (!res.headersSent) {
						res.status(500).json({
							error: true, 
							message: 'Unexpected response format from dictionary service'
						});
					}
				}
			});
		} catch (error) {
			console.error('Unexpected error in /dictionnary/user route:', error);
			if (!res.headersSent) {
				res.status(500).json({
					error: true,
					message: 'Server error while processing request'
				});
			}
		}
	});	//Add a dictionnary
	app.post('/dictionnary', (req, res) => {
		try {
			console.log('Dictionary POST request body:', JSON.stringify(req.body, null, 2));
			
			// Validate required fields
			if (!req.body || !req.body.word) {
				return res.status(400).json({
					error: true,
					message: 'Missing required field: word'
				});
			}
			
			// Ensure all fields are properly sent
			console.log('Raw request fields:', {
				word: req.body.word,
				definition: req.body.definition,
				part_of_speech: req.body.part_of_speech,
				pronunciation: req.body.pronunciation
			});
			
			// Create new dictionary entry
			console.log('Individual fields before creating dictionary object:',
				'word:', req.body.word,
				'definition:', req.body.definition, 
				'part_of_speech:', req.body.part_of_speech,
				'pronunciation:', req.body.pronunciation);
				
			let bodyNewDictionnary = new Dictionnary(null, null, req.body);
			console.log('Dictionary object after creation:', JSON.stringify(bodyNewDictionnary.toObject(), null, 2));
			
			// Get user ID from token
			const token = req.get('Authorization');
			if (!token) {
				return res.status(401).json({ error: true, message: 'Unauthorized: No token provided' });
			}
			
			try {
				const tokenPayload = token.split(' ')[1];
				if (!tokenPayload) {
					throw new Error('Invalid token format');
				}
				bodyNewDictionnary.user_id = jwtDecode(tokenPayload).sub.toString();
			} catch (tokenError) {
				return res.status(401).json({ error: true, message: 'Invalid or expired token' });
			}
			
			// Insert the new dictionary entry
			dictionnaryService.INSERT(bodyNewDictionnary, (newDictionnary) => {
				console.log(newDictionnary);
				if (newDictionnary.code) {
					if (!res.headersSent) {
						res.status(newDictionnary.code || 400).json({
							error: true,
							message: newDictionnary.errorMessage || 'Error adding word to dictionary'
						});
					}
					return;
				} else {
					if (!res.headersSent) {
						res.status(200).send(newDictionnary.id);
					}
				}
			});
		} catch (error) {
			console.error('Unexpected error in /dictionnary POST route:', error);
			if (!res.headersSent) {
				res.status(500).json({
					error: true,
					message: 'Server error while processing request'
				});
			}
		}
	});

	// Delete a dictionary entry
	app.delete('/dictionnary/:id', (req, res) => {
		try {
			let dictionnary = {
				word_id: req.params.id
			};
			
			dictionnaryService.DELETE(dictionnary, (result) => {
				if (result && result.code) {
					if (!res.headersSent) {
						res.status(result.code || 400).json({
							error: true,
							message: result.errorMessage || 'Error deleting word from dictionary'
						});
					}
					return;
				}
				
				if (!res.headersSent) {
					res.status(200).json({'message': 'Word deleted successfully'});
				}
			});		} catch (error) {
			console.error('Unexpected error in /dictionnary/:id DELETE route:', error);
			if (!res.headersSent) {
				res.status(500).json({
					error: true,
					message: 'Server error while processing request'
				});
			}
		}
	});
	
	// Toggle learned status for a dictionary word
	app.put('/toggle-learnedle-learned', async (req, res) => {
		try {
			const { word_id } = req.body;
			
			if (!word_id) {
				return res.status(400).json({
					error: true,
					message: 'Missing word_id parameter'
				});
			}
			
			// First get the current value
			const query = "SELECT learned FROM user_dictionnary WHERE word_id = $1";
			const result = await pool.query(query, [word_id]);
			
			if (result.rows.length === 0) {
				return res.status(404).json({
					error: true,
					message: 'Dictionary word not found'
				});
			}
			
			// Toggle the current value
			const currentValue = result.rows[0].learned || false;
			const newValue = !currentValue;
			
			// Update the value in the database
			const updateQuery = "UPDATE user_dictionnary SET learned = $1, updated_at = NOW() WHERE word_id = $2";
			await pool.query(updateQuery, [newValue, word_id]);
			
			res.status(200).json({
				message: 'Learned status toggled successfully',
				learned: newValue
			});
		} catch (error) {
			console.error('Unexpected error in /toggle-learnedle-learned route:', error);
			res.status(500).json({
				error: true,
				message: 'Server error while processing request'
			});
		}
	});
};
