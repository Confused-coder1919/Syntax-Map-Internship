// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import user ressources
const Notepad = require('./Notepad.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js')

// import syntaxe
const getSyntaxe = require("../../parser/syntaxePostgres.js")

class NotepadDao extends InterfaceDao {

	constructor () {
		super()
	}

	// NOTEPAD DAO : Public methods

	INSERT (notepad, callback) {
		const noteId = uuidv4();
		const values = [
			noteId,
			notepad.user_id,
			getSyntaxe(notepad.content_type),
			getSyntaxe(notepad.content),
			new Date().toISOString(),
			new Date().toISOString(),
			getSyntaxe(notepad.reference_id),
			getSyntaxe(notepad.reference_type),
			notepad.is_reviewed,
			notepad.is_learned,
			JSON.stringify(notepad.tags || []),
			getSyntaxe(notepad.pronunciation),
			getSyntaxe(notepad.meaning),
			getSyntaxe(notepad.category)
		];
		
		const qtext = `INSERT INTO notepad_table(
			id, 
			user_id, 
			content_type, 
			content, 
			created_at, 
			updated_at, 
			reference_id, 
			reference_type, 
			is_reviewed, 
			is_learned, 
			tags, 
			pronunciation, 
			meaning, 
			category
		) VALUES (
			${this.dv(values[0])}, 
			${this.dv(values[1])}, 
			${this.dv(values[2])}, 
			${this.dv(values[3])}, 
			${this.dv(values[4])}, 
			${this.dv(values[5])}, 
			${this.dv(values[6])}, 
			${this.dv(values[7])}, 
			${this.dv(values[8])}, 
			${this.dv(values[9])}, 
			${this.dv(values[10])}, 
			${this.dv(values[11])}, 
			${this.dv(values[12])}, 
			${this.dv(values[13])}
		) RETURNING *`;
		
		pool.query(qtext)
			.then(res => {
				notepad.note_id = noteId;
				callback(notepad);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
			});
	}

	UPDATE (notepad, callback) {
		const noteId = notepad.note_id;
		if (!noteId) {
			return this.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'Note ID is required'
			}, callback);
		}
		
		const values = [
			noteId,
			getSyntaxe(notepad.content),
			new Date().toISOString(),
			notepad.is_reviewed,
			notepad.is_learned,
			JSON.stringify(notepad.tags || []),
			getSyntaxe(notepad.pronunciation),
			getSyntaxe(notepad.meaning),
			getSyntaxe(notepad.category)
		];
		
		const qtext = `UPDATE notepad_table SET 
			content = ${this.dv(values[1])},
			updated_at = ${this.dv(values[2])},
			is_reviewed = ${this.dv(values[3])},
			is_learned = ${this.dv(values[4])},
			tags = ${this.dv(values[5])},
			pronunciation = ${this.dv(values[6])},
			meaning = ${this.dv(values[7])},
			category = ${this.dv(values[8])}
			WHERE id = ${this.dv(values[0])}
			RETURNING *`;
		
		pool.query(qtext)
			.then(res => {
				if (res.rowCount === 0) {
					this.ErrorHandling({
						'code': 'NOT_FOUND',
						'message': 'Note not found with the provided ID'
					}, callback);
				} else {
					callback(notepad);
				}
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
			});
	}

	SELECT (criteria, callback) {
		let qtext = 'SELECT * FROM notepad_table';
		
		// Basic filtering
		if (criteria.user_id)
			qtext = this.actq(qtext, 'user_id', criteria.user_id);
		if (criteria.content_type)
			qtext = this.actq(qtext, 'content_type', criteria.content_type);
		if (criteria.reference_id)
			qtext = this.actq(qtext, 'reference_id', criteria.reference_id);
		if (criteria.reference_type)
			qtext = this.actq(qtext, 'reference_type', criteria.reference_type);
		if (criteria.is_reviewed !== undefined)
			qtext = this.actq(qtext, 'is_reviewed', criteria.is_reviewed);
		if (criteria.is_learned !== undefined)
			qtext = this.actq(qtext, 'is_learned', criteria.is_learned);
		if (criteria.category)
			qtext = this.actq(qtext, 'category', criteria.category);
			
		// Content search (partial match)
		if (criteria.content_search) {
			if (qtext.includes('WHERE')) {
				qtext += ` AND content ILIKE '%${criteria.content_search}%'`;
			} else {
				qtext += ` WHERE content ILIKE '%${criteria.content_search}%'`;
			}
		}
		
		// Tag search
		if (criteria.tag) {
			if (qtext.includes('WHERE')) {
				qtext += ` AND tags::jsonb ? '${criteria.tag}'`;
			} else {
				qtext += ` WHERE tags::jsonb ? '${criteria.tag}'`;
			}
		}
		
		// Date range filtering
		if (criteria.start_date && criteria.end_date) {
			if (qtext.includes('WHERE')) {
				qtext += ` AND created_at BETWEEN '${criteria.start_date}' AND '${criteria.end_date}'`;
			} else {
				qtext += ` WHERE created_at BETWEEN '${criteria.start_date}' AND '${criteria.end_date}'`;
			}
		} else if (criteria.start_date) {
			if (qtext.includes('WHERE')) {
				qtext += ` AND created_at >= '${criteria.start_date}'`;
			} else {
				qtext += ` WHERE created_at >= '${criteria.start_date}'`;
			}
		} else if (criteria.end_date) {
			if (qtext.includes('WHERE')) {
				qtext += ` AND created_at <= '${criteria.end_date}'`;
			} else {
				qtext += ` WHERE created_at <= '${criteria.end_date}'`;
			}
		}
		
		// Add ORDER BY clause
		if (criteria.orderBy) {
			qtext += ` ORDER BY ${criteria.orderBy}`;
			if (criteria.orderDirection) {
				qtext += ` ${criteria.orderDirection}`;
			}
		} else {
			// Default order by most recent
			qtext += ' ORDER BY created_at DESC';
		}
		
		// Add LIMIT and OFFSET for pagination
		if (criteria.limit) {
			qtext += ` LIMIT ${parseInt(criteria.limit, 10)}`;
			if (criteria.offset) {
				qtext += ` OFFSET ${parseInt(criteria.offset, 10)}`;
			}
		}
		
		pool.query(qtext)
			.then(res => {
				const notepads = res.rows.map(row => new Notepad(null, row, null));
				callback(notepads);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
			});
	}

	DELETE (notepad, callback) {
		if (!notepad.note_id) {
			return this.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'Note ID is required'
			}, callback);
		}
		
		const qtext = 'DELETE FROM notepad_table WHERE id = $1 RETURNING *';
		const values = [notepad.note_id];
		
		pool.query(qtext, values)
			.then(res => {
				if (res.rowCount === 0) {
					this.ErrorHandling({
						'code': 'NOT_FOUND',
						'message': 'Note not found with the provided ID'
					}, callback);
				} else {
					callback({
						success: true,
						message: 'Note deleted successfully',
						note_id: notepad.note_id
					});
				}
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
			});
	}
	
	// Add mistake to notepad from quiz answer
	ADD_MISTAKE(userId, question, userAnswer, correctAnswer, tenseId, callback) {
		const notepad = new Notepad(null, null, {
			user_id: userId,
			content_type: 'mistake',
			content: userAnswer,
			reference_id: question.question_id || question.id,
			reference_type: 'quiz',
			is_reviewed: false,
			tags: ['mistake', 'quiz'],
			meaning: correctAnswer,
			category: 'quiz-mistakes'
		});
		
		// If tense ID is provided, add it as reference
		if (tenseId) {
			notepad.reference_id = tenseId;
			notepad.reference_type = 'tense';
		}
		
		this.INSERT(notepad, callback);
	}
	
	// Add vocabulary word to notepad
	ADD_VOCABULARY(userId, word, meaning, pronunciation, callback) {
		const notepad = new Notepad(null, null, {
			user_id: userId,
			content_type: 'vocabulary',
			content: word,
			is_learned: false,
			tags: ['vocabulary'],
			pronunciation: pronunciation,
			meaning: meaning,
			category: 'vocabulary'
		});
		
		this.INSERT(notepad, callback);
	}
	
	// Get all mistakes for a user
	GET_USER_MISTAKES(userId, isReviewed, callback) {
		const criteria = {
			user_id: userId,
			content_type: 'mistake',
			orderBy: 'created_at',
			orderDirection: 'DESC'
		};
		
		// If isReviewed is provided, filter by it
		if (isReviewed !== undefined) {
			criteria.is_reviewed = isReviewed;
		}
		
		this.SELECT(criteria, callback);
	}
	
	// Get all vocabulary words for a user
	GET_USER_VOCABULARY(userId, isLearned, callback) {
		const criteria = {
			user_id: userId,
			content_type: 'vocabulary',
			orderBy: 'content',
			orderDirection: 'ASC'
		};
		
		// If isLearned is provided, filter by it
		if (isLearned !== undefined) {
			criteria.is_learned = isLearned;
		}
		
		this.SELECT(criteria, callback);
	}
	
	// Mark a mistake as reviewed
	MARK_MISTAKE_REVIEWED(noteId, callback) {
		pool.query(
			'UPDATE notepad_table SET is_reviewed = true, updated_at = NOW() WHERE id = $1 AND content_type = $2 RETURNING *',
			[noteId, 'mistake']
		)
			.then(res => {
				if (res.rowCount === 0) {
					this.ErrorHandling({
						'code': 'NOT_FOUND',
						'message': 'Mistake not found with the provided ID'
					}, callback);
				} else {
					callback({
						success: true,
						message: 'Mistake marked as reviewed',
						note: new Notepad(null, res.rows[0], null)
					});
				}
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
			});
	}
	
	// Mark a vocabulary word as learned
	MARK_VOCABULARY_LEARNED(noteId, isLearned, callback) {
		pool.query(
			'UPDATE notepad_table SET is_learned = $1, updated_at = NOW() WHERE id = $2 AND content_type = $3 RETURNING *',
			[isLearned, noteId, 'vocabulary']
		)
			.then(res => {
				if (res.rowCount === 0) {
					this.ErrorHandling({
						'code': 'NOT_FOUND',
						'message': 'Vocabulary not found with the provided ID'
					}, callback);
				} else {
					callback({
						success: true,
						message: isLearned ? 'Vocabulary marked as learned' : 'Vocabulary marked as not learned',
						note: new Notepad(null, res.rows[0], null)
					});
				}
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
			});
	}
	
	// Get statistics on a user's notepad usage
	GET_USER_NOTEPAD_STATS(userId, callback) {
		const query = `
			SELECT
				COUNT(*) AS total_items,
				SUM(CASE WHEN content_type = 'mistake' THEN 1 ELSE 0 END) AS total_mistakes,
				SUM(CASE WHEN content_type = 'mistake' AND is_reviewed = true THEN 1 ELSE 0 END) AS reviewed_mistakes,
				SUM(CASE WHEN content_type = 'vocabulary' THEN 1 ELSE 0 END) AS total_vocabulary,
				SUM(CASE WHEN content_type = 'vocabulary' AND is_learned = true THEN 1 ELSE 0 END) AS learned_vocabulary,
				SUM(CASE WHEN content_type = 'example' THEN 1 ELSE 0 END) AS total_examples,
				COUNT(DISTINCT reference_id) AS unique_references
			FROM notepad_table
			WHERE user_id = $1
		`;
		
		pool.query(query, [userId])
			.then(res => {
				callback(res.rows[0]);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
			});
	}
}

module.exports = NotepadDao;