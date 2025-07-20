// import notepad ressources
const Notepad = require('../modules/Ressources.Notepad/Notepad.js');
const NotepadService = require('../modules/Ressources.Notepad/NotepadService.js');

// import decoder jwt
const jwtDecode = require("jwt-decode");

//import passport for auth
const passport = require('passport');

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

module.exports = (app) => {
	
var notepadService = new NotepadService();

	// Helper function to extract user role from token
	const extractUserRole = (req) => {
		try {
			if (!req.get('Authorization')) {
				return 4; // Default to guest role (4)
			}
			
			const token = req.get('Authorization').split(' ')[1];
			const decoded = jwtDecode(token);
			
			// Check if user_role is available in token
			if (decoded.user_role !== undefined) {
				return parseInt(decoded.user_role, 10);
			}
			
			return 4; // Default to guest if role not in token
		} catch (error) {
			console.error('Error extracting user role:', error);
			return 4; // Default to guest on error
		}
	};
	
	// Helper function to extract user ID from token
	const extractUserId = (req) => {
		try {
			if (!req.get('Authorization')) {
				return null;
			}
			
			const token = req.get('Authorization').split(' ')[1];
			const decoded = jwtDecode(token);
			
			return decoded.sub || decoded.user_id;
		} catch (error) {
			console.error('Error extracting user ID:', error);
			return null;
		}
	};

	//========================
	// GENERAL NOTEPAD ROUTES
	//========================

	// Get all notepads (admin only)
	app.get('/notepads', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			
			// Only admin users can get all notepads
			if (userRole !== 1) {
				return res.status(403).json({ msg: "Only administrators can view all notepads" });
			}
			
			notepadService.SELECT({}, userRole, (notepads) => {
				if (!notepads || notepads.code) {
					return res.status(406).json({ 
						msg: "Failed to retrieve notepads", 
						error: notepads?.errorMessage || "Unknown error" 
					});
				}
				
				return res.status(200).json({ notepads });
			});
		} catch (error) {
			console.error('Unexpected error in get all notepads:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});

	// Get a user's notepads
	app.get('/user/notepads', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			const userId = extractUserId(req);
			
			if (!userId) {
				return res.status(401).json({ msg: "User ID not found in token" });
			}
			
			// Filter criteria
			const criteria = {
				user_id: userId
			};
			
			// Add optional filters if provided
			if (req.query.content_type) {
				criteria.content_type = req.query.content_type;
			}
			
			if (req.query.category) {
				criteria.category = req.query.category;
			}
			
			if (req.query.tag) {
				criteria.tag = req.query.tag;
			}
			
			if (req.query.content_search) {
				criteria.content_search = req.query.content_search;
			}
			
			// Add pagination
			if (req.query.limit) {
				criteria.limit = parseInt(req.query.limit, 10);
				if (req.query.page) {
					const page = Math.max(0, parseInt(req.query.page, 10) - 1); // 1-based to 0-based
					criteria.offset = page * criteria.limit;
				}
			}
			
			notepadService.SELECT(criteria, userRole, (notepads) => {
				if (!notepads || notepads.code) {
					return res.status(406).json({ 
						msg: "Failed to retrieve notepads", 
						error: notepads?.errorMessage || "Unknown error" 
					});
				}
				
				return res.status(200).json({ notepads });
			});
		} catch (error) {
			console.error('Unexpected error in get user notepads:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});

	// Create a custom note
	app.post('/note/custom', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			const userId = extractUserId(req);
			
			if (!userId) {
				return res.status(401).json({ msg: "User ID not found in token" });
			}
			
			if (!req.body || !req.body.content) {
				return res.status(400).json({ msg: "Note content is required" });
			}
			
			notepadService.ADD_CUSTOM_NOTE(
				userId,
				req.body.content,
				req.body.category,
				req.body.tags,
				userRole,
				(note) => {
					if (!note || note.code) {
						return res.status(note?.code || 500).json({ 
							msg: "Failed to create note", 
							error: note?.errorMessage || "Unknown error" 
						});
					}
					
					return res.status(201).json({ note });
				}
			);
		} catch (error) {
			console.error('Unexpected error in note creation:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});

	// Update a note
	app.put('/note/:id', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			const userId = extractUserId(req);
			
			if (!userId) {
				return res.status(401).json({ msg: "User ID not found in token" });
			}
			
			if (!req.params.id) {
				return res.status(400).json({ msg: "Note ID is required" });
			}
			
			if (!req.body || !req.body.content) {
				return res.status(400).json({ msg: "Note content is required" });
			}
			
			const notepad = new Notepad(null, null, {
				note_id: req.params.id,
				content: req.body.content,
				tags: req.body.tags,
				category: req.body.category
			});
			
			notepadService.UPDATE(notepad, userRole, (note) => {
				if (!note || note.code) {
					return res.status(note?.code || 406).json({ 
						msg: "Failed to update note", 
						error: note?.errorMessage || "Unknown error" 
					});
				}
				
				return res.status(200).json({ note });
			});
		} catch (error) {
			console.error('Unexpected error in note update:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});

	// Delete a note
	app.delete('/note/:id', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			const userId = extractUserId(req);
			
			if (!userId) {
				return res.status(401).json({ msg: "User ID not found in token" });
			}
			
			if (!req.params.id) {
				return res.status(400).json({ msg: "Note ID is required" });
			}
			
			const notepad = new Notepad(null, null, {
				note_id: req.params.id
			});
			
			notepadService.DELETE(notepad, userRole, (result) => {
				if (!result || result.code) {
					return res.status(result?.code || 404).json({ 
						msg: "Failed to delete note", 
						error: result?.errorMessage || "Unknown error" 
					});
				}
				
				return res.status(200).json(result);
			});
		} catch (error) {
			console.error('Unexpected error in note deletion:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});

	//========================
	// MISTAKES TRACKING ROUTES
	//========================

	// Add a quiz mistake
	app.post('/note/mistake/quiz', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			const userId = extractUserId(req);
			
			if (!userId) {
				return res.status(401).json({ msg: "User ID not found in token" });
			}
			
			if (!req.body || !req.body.question || !req.body.user_answer || !req.body.correct_answer) {
				return res.status(400).json({ msg: "Question, user answer, and correct answer are required" });
			}
			
			notepadService.ADD_QUIZ_MISTAKE(
				userId,
				req.body.question,
				req.body.user_answer,
				req.body.correct_answer,
				req.body.tense_id,
				userRole,
				(mistake) => {
					if (!mistake || mistake.code) {
						return res.status(mistake?.code || 500).json({ 
							msg: "Failed to save mistake", 
							error: mistake?.errorMessage || "Unknown error" 
						});
					}
					
					return res.status(201).json({ mistake });
				}
			);
		} catch (error) {
			console.error('Unexpected error in mistake tracking:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});

	// Get user's mistakes
	app.get('/note/mistakes', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			const userId = extractUserId(req);
			
			if (!userId) {
				return res.status(401).json({ msg: "User ID not found in token" });
			}
			
			// Convert is_reviewed query param to boolean if present
			let isReviewed = undefined;
			if (req.query.is_reviewed !== undefined) {
				isReviewed = req.query.is_reviewed === 'true';
			}
			
			notepadService.GET_MISTAKES(userId, isReviewed, userRole, (mistakes) => {
				if (!mistakes || mistakes.code) {
					return res.status(mistakes?.code || 500).json({ 
						msg: "Failed to retrieve mistakes", 
						error: mistakes?.errorMessage || "Unknown error" 
					});
				}
				
				return res.status(200).json({ mistakes });
			});
		} catch (error) {
			console.error('Unexpected error retrieving mistakes:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});

	// Mark mistake as reviewed
	app.put('/note/mistake/:id/review', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			const userId = extractUserId(req);
			
			if (!userId) {
				return res.status(401).json({ msg: "User ID not found in token" });
			}
			
			if (!req.params.id) {
				return res.status(400).json({ msg: "Mistake ID is required" });
			}
			
			notepadService.MARK_MISTAKE_REVIEWED(req.params.id, userId, userRole, (result) => {
				if (!result || result.code) {
					return res.status(result?.code || 500).json({ 
						msg: "Failed to mark mistake as reviewed", 
						error: result?.errorMessage || "Unknown error" 
					});
				}
				
				return res.status(200).json(result);
			});
		} catch (error) {
			console.error('Unexpected error marking mistake as reviewed:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});

	//========================
	// VOCABULARY ROUTES
	//========================

	// Add a vocabulary word
	app.post('/note/vocabulary', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			const userId = extractUserId(req);
			
			if (!userId) {
				return res.status(401).json({ msg: "User ID not found in token" });
			}
			
			if (!req.body || !req.body.word) {
				return res.status(400).json({ msg: "Vocabulary word is required" });
			}
			
			notepadService.ADD_VOCABULARY(
				userId,
				req.body.word,
				req.body.meaning,
				req.body.pronunciation,
				userRole,
				(vocabulary) => {
					if (!vocabulary || vocabulary.code) {
						return res.status(vocabulary?.code || 500).json({ 
							msg: "Failed to save vocabulary", 
							error: vocabulary?.errorMessage || "Unknown error" 
						});
					}
					
					return res.status(201).json({ vocabulary });
				}
			);
		} catch (error) {
			console.error('Unexpected error in vocabulary tracking:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});

	// Get user's vocabulary
	app.get('/note/vocabulary', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			const userId = extractUserId(req);
			
			if (!userId) {
				return res.status(401).json({ msg: "User ID not found in token" });
			}
			
			// Convert is_learned query param to boolean if present
			let isLearned = undefined;
			if (req.query.is_learned !== undefined) {
				isLearned = req.query.is_learned === 'true';
			}
			
			notepadService.GET_VOCABULARY(userId, isLearned, userRole, (vocabulary) => {
				if (!vocabulary || vocabulary.code) {
					return res.status(vocabulary?.code || 500).json({ 
						msg: "Failed to retrieve vocabulary", 
						error: vocabulary?.errorMessage || "Unknown error" 
					});
				}
				
				return res.status(200).json({ vocabulary });
			});
		} catch (error) {
			console.error('Unexpected error retrieving vocabulary:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});

	// Mark vocabulary as learned/not learned
	app.put('/note/vocabulary/:id/status', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			const userId = extractUserId(req);
			
			if (!userId) {
				return res.status(401).json({ msg: "User ID not found in token" });
			}
			
			if (!req.params.id) {
				return res.status(400).json({ msg: "Vocabulary ID is required" });
			}
			
			if (req.body.is_learned === undefined) {
				return res.status(400).json({ msg: "is_learned status is required" });
			}
			
			const isLearned = req.body.is_learned === true;
			
			notepadService.MARK_VOCABULARY_LEARNED(req.params.id, userId, isLearned, userRole, (result) => {
				if (!result || result.code) {
					return res.status(result?.code || 500).json({ 
						msg: "Failed to update vocabulary status", 
						error: result?.errorMessage || "Unknown error" 
					});
				}
				
				return res.status(200).json(result);
			});
		} catch (error) {
			console.error('Unexpected error updating vocabulary status:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});

	//========================
	// STATISTICS ROUTES
	//========================

	// Get user notepad stats
	app.get('/note/stats', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			const userId = extractUserId(req);
			
			if (!userId) {
				return res.status(401).json({ msg: "User ID not found in token" });
			}
			
			notepadService.GET_USER_STATS(userId, userRole, (stats) => {
				if (!stats || stats.code) {
					return res.status(stats?.code || 500).json({ 
						msg: "Failed to retrieve notepad statistics", 
						error: stats?.errorMessage || "Unknown error" 
					});
				}
				
				return res.status(200).json({ stats });
			});
		} catch (error) {
			console.error('Unexpected error retrieving notepad statistics:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});
	
	// Teacher/admin - get student's notepad stats
	app.get('/student/:id/note/stats', passport.authenticate('user_connected', { session: false }), (req, res) => {
		try {
			const userRole = extractUserRole(req);
			
			// Only teachers and admins can access student stats
			if (userRole !== 1 && userRole !== 2) {
				return res.status(403).json({ msg: "Only teachers and administrators can access student statistics" });
			}
			
			if (!req.params.id) {
				return res.status(400).json({ msg: "Student ID is required" });
			}
			
			notepadService.GET_USER_STATS(req.params.id, userRole, (stats) => {
				if (!stats || stats.code) {
					return res.status(stats?.code || 500).json({ 
						msg: "Failed to retrieve student notepad statistics", 
						error: stats?.errorMessage || "Unknown error" 
					});
				}
				
				return res.status(200).json({ stats });
			});
		} catch (error) {
			console.error('Unexpected error retrieving student notepad statistics:', error);
			return res.status(500).json({ msg: "Internal server error" });
		}
	});
};