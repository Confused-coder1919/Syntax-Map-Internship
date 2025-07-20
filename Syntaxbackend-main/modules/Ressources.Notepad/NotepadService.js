const NotepadDao = require('./NotepadDao');
const Notepad = require('./Notepad');

class NotepadService {

	#notepadDao = new NotepadDao();

	constructor () {
	}

	// Basic CRUD operations with role-based access control
	
	SELECT (criteria, userRole, callback) {
		// Validate that we have criteria and a user role
		if (!criteria) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'Selection criteria are required'
			}, callback);
		}
		
		// Only allow access to own notes (except for admins)
		if (userRole !== 1 && !criteria.user_id) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'You must specify a user_id to view notes'
			}, callback);
		}
		
		// Proceed with the selection
		this.#notepadDao.SELECT(criteria, callback);
	}

	INSERT (bodyNewNotepad, userRole, callback) {
		// Validate that we have a notepad and a user role
		if (!bodyNewNotepad) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'Notepad data is required'
			}, callback);
		}
		
		// Guest users cannot create notes
		if (userRole === 4) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'Guest users cannot create notes'
			}, callback);
		}
		
		// Only admin and teachers can create notes for other users
		if (userRole !== 1 && userRole !== 2 && bodyNewNotepad.user_id !== this.getCurrentUserId()) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'You can only create notes for yourself'
			}, callback);
		}
		
		// Proceed with the insertion
		this.#notepadDao.INSERT(bodyNewNotepad, callback);
	}

	UPDATE (notepad, userRole, callback) {
		// Validate that we have a notepad and a user role
		if (!notepad || !notepad.note_id) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'Notepad data with ID is required'
			}, callback);
		}
		
		// Guest users cannot update notes
		if (userRole === 4) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'Guest users cannot update notes'
			}, callback);
		}
		
		// Verify ownership if not admin/teacher
		if (userRole !== 1 && userRole !== 2) {
			// Fetch the note to check ownership
			this.#notepadDao.SELECT({ note_id: notepad.note_id }, (existingNotes) => {
				if (!existingNotes || existingNotes.length === 0) {
					return this.#notepadDao.ErrorHandling({
						'code': 'NOT_FOUND',
						'message': 'Note not found'
					}, callback);
				}
				
				const existingNote = existingNotes[0];
				if (existingNote.user_id !== this.getCurrentUserId()) {
					return this.#notepadDao.ErrorHandling({
						'code': 'UNAUTHORIZED',
						'message': 'You can only update your own notes'
					}, callback);
				}
				
				// Ownership verified, proceed with update
				this.#notepadDao.UPDATE(notepad, callback);
			});
		} else {
			// Admin or teacher, proceed directly
			this.#notepadDao.UPDATE(notepad, callback);
		}
	}

	DELETE (notepad, userRole, callback) {
		// Validate that we have a notepad and a user role
		if (!notepad || !notepad.note_id) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'Notepad ID is required'
			}, callback);
		}
		
		// Guest users cannot delete notes
		if (userRole === 4) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'Guest users cannot delete notes'
			}, callback);
		}
		
		// Verify ownership if not admin/teacher
		if (userRole !== 1 && userRole !== 2) {
			// Fetch the note to check ownership
			this.#notepadDao.SELECT({ note_id: notepad.note_id }, (existingNotes) => {
				if (!existingNotes || existingNotes.length === 0) {
					return this.#notepadDao.ErrorHandling({
						'code': 'NOT_FOUND',
						'message': 'Note not found'
					}, callback);
				}
				
				const existingNote = existingNotes[0];
				if (existingNote.user_id !== this.getCurrentUserId()) {
					return this.#notepadDao.ErrorHandling({
						'code': 'UNAUTHORIZED',
						'message': 'You can only delete your own notes'
					}, callback);
				}
				
				// Ownership verified, proceed with deletion
				this.#notepadDao.DELETE(notepad, callback);
			});
		} else {
			// Admin or teacher, proceed directly
			this.#notepadDao.DELETE(notepad, callback);
		}
	}
	
	// Helper method to get the current user ID (to be replaced with actual token extraction)
	getCurrentUserId() {
		// This is a placeholder. In a real implementation, this would extract the user ID from the JWT token
		// For now we'll return null, indicating that ownership checks should be performed elsewhere
		return null;
	}
	
	// Specialized methods for mistake tracking
	
	// Add a mistake to the notepad
	ADD_QUIZ_MISTAKE(userId, question, userAnswer, correctAnswer, tenseId, userRole, callback) {
		// Validate inputs
		if (!userId || !question || !userAnswer || !correctAnswer) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'User ID, question, user answer, and correct answer are required'
			}, callback);
		}
		
		// Ensure the user has proper permissions
		if (userRole === 4) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'Guest users cannot track mistakes'
			}, callback);
		}
		
		// Regular users can only add mistakes for themselves
		if (userRole !== 1 && userRole !== 2 && userId !== this.getCurrentUserId()) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'You can only track mistakes for yourself'
			}, callback);
		}
		
		// Add the mistake
		this.#notepadDao.ADD_MISTAKE(userId, question, userAnswer, correctAnswer, tenseId, callback);
	}
	
	// Get all mistakes for a user
	GET_MISTAKES(userId, isReviewed, userRole, callback) {
		// Validate inputs
		if (!userId) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'User ID is required'
			}, callback);
		}
		
		// Regular users can only view their own mistakes
		if (userRole !== 1 && userRole !== 2 && userId !== this.getCurrentUserId()) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'You can only view your own mistakes'
			}, callback);
		}
		
		// Fetch mistakes
		this.#notepadDao.GET_USER_MISTAKES(userId, isReviewed, callback);
	}
	
	// Mark a mistake as reviewed
	MARK_MISTAKE_REVIEWED(noteId, userId, userRole, callback) {
		// Validate inputs
		if (!noteId || !userId) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'Note ID and User ID are required'
			}, callback);
		}
		
		// Regular users can only mark their own mistakes as reviewed
		if (userRole !== 1 && userRole !== 2 && userId !== this.getCurrentUserId()) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'You can only review your own mistakes'
			}, callback);
		}
		
		// Check ownership
		this.#notepadDao.SELECT({ note_id: noteId }, (notes) => {
			if (!notes || notes.length === 0) {
				return this.#notepadDao.ErrorHandling({
					'code': 'NOT_FOUND',
					'message': 'Note not found'
				}, callback);
			}
			
			const note = notes[0];
			if (note.user_id !== userId && userRole !== 1 && userRole !== 2) {
				return this.#notepadDao.ErrorHandling({
					'code': 'UNAUTHORIZED',
					'message': 'You can only review your own mistakes'
				}, callback);
			}
			
			// Mark as reviewed
			this.#notepadDao.MARK_MISTAKE_REVIEWED(noteId, callback);
		});
	}
	
	// Specialized methods for vocabulary management
	
	// Add a vocabulary word
	ADD_VOCABULARY(userId, word, meaning, pronunciation, userRole, callback) {
		// Validate inputs
		if (!userId || !word) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'User ID and vocabulary word are required'
			}, callback);
		}
		
		// Ensure the user has proper permissions
		if (userRole === 4) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'Guest users cannot save vocabulary'
			}, callback);
		}
		
		// Regular users can only add vocabulary for themselves
		if (userRole !== 1 && userRole !== 2 && userId !== this.getCurrentUserId()) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'You can only add vocabulary for yourself'
			}, callback);
		}
		
		// Add the vocabulary
		this.#notepadDao.ADD_VOCABULARY(userId, word, meaning, pronunciation, callback);
	}
	
	// Get vocabulary for a user
	GET_VOCABULARY(userId, isLearned, userRole, callback) {
		// Validate inputs
		if (!userId) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'User ID is required'
			}, callback);
		}
		
		// Regular users can only view their own vocabulary
		if (userRole !== 1 && userRole !== 2 && userId !== this.getCurrentUserId()) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'You can only view your own vocabulary'
			}, callback);
		}
		
		// Fetch vocabulary
		this.#notepadDao.GET_USER_VOCABULARY(userId, isLearned, callback);
	}
	
	// Mark vocabulary as learned/not learned
	MARK_VOCABULARY_LEARNED(noteId, userId, isLearned, userRole, callback) {
		// Validate inputs
		if (!noteId || !userId) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'Note ID and User ID are required'
			}, callback);
		}
		
		// Regular users can only mark their own vocabulary
		if (userRole !== 1 && userRole !== 2 && userId !== this.getCurrentUserId()) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'You can only update your own vocabulary'
			}, callback);
		}
		
		// Check ownership
		this.#notepadDao.SELECT({ note_id: noteId }, (notes) => {
			if (!notes || notes.length === 0) {
				return this.#notepadDao.ErrorHandling({
					'code': 'NOT_FOUND',
					'message': 'Note not found'
				}, callback);
			}
			
			const note = notes[0];
			if (note.user_id !== userId && userRole !== 1 && userRole !== 2) {
				return this.#notepadDao.ErrorHandling({
					'code': 'UNAUTHORIZED',
					'message': 'You can only update your own vocabulary'
				}, callback);
			}
			
			// Mark as learned/not learned
			this.#notepadDao.MARK_VOCABULARY_LEARNED(noteId, isLearned, callback);
		});
	}
	
	// Get statistics on a user's notepad
	GET_USER_STATS(userId, userRole, callback) {
		// Validate inputs
		if (!userId) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'User ID is required'
			}, callback);
		}
		
		// Regular users can only view their own stats
		if (userRole !== 1 && userRole !== 2 && userId !== this.getCurrentUserId()) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'You can only view your own stats'
			}, callback);
		}
		
		// Get statistics
		this.#notepadDao.GET_USER_NOTEPAD_STATS(userId, callback);
	}
	
	// Custom note creation
	ADD_CUSTOM_NOTE(userId, content, category, tags, userRole, callback) {
		// Validate inputs
		if (!userId || !content) {
			return this.#notepadDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'User ID and content are required'
			}, callback);
		}
		
		// Ensure the user has proper permissions
		if (userRole === 4) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'Guest users cannot create notes'
			}, callback);
		}
		
		// Regular users can only add notes for themselves
		if (userRole !== 1 && userRole !== 2 && userId !== this.getCurrentUserId()) {
			return this.#notepadDao.ErrorHandling({
				'code': 'UNAUTHORIZED',
				'message': 'You can only create notes for yourself'
			}, callback);
		}
		
		// Create the note
		const note = new Notepad(null, null, {
			user_id: userId,
			content_type: 'note',
			content: content,
			category: category || 'general',
			tags: tags || []
		});
		
		this.#notepadDao.INSERT(note, callback);
	}
}

module.exports = NotepadService;
