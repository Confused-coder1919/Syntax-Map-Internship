// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import user ressources
const Dictionnary = require('./Dictionnary.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js');

// import syntaxe
const getSyntaxe = require("../../parser/syntaxePostgres.js");

class DictionnaryDao extends InterfaceDao {

	constructor () {
		super();
	}

	// DICTIONNARY DAO : Public methods
	INSERT (dictionnary, callback) {
		console.log('DICTIONNARY_DAO');
		console.log('Dictionary object being inserted:', {
			word: dictionnary.word,
			definition: dictionnary.definition,
			part_of_speech: dictionnary.part_of_speech,
			pronunciation: dictionnary.pronunciation,
			user_id: dictionnary.user_id,
			session_name: dictionnary.session_name,
			learned: dictionnary.learned
		});
		
		// Debug getters
		console.log('Direct getter values:', {
			definition: dictionnary.definition, 
			part_of_speech: dictionnary.part_of_speech,
			pronunciation: dictionnary.pronunciation
		});
		
		// Debug complete object
		console.log('Full dictionary object:', dictionnary.toObject());
		
		const wordId = "DEFAULT"; //uuidv4()
		const values = [
			wordId, 
			getSyntaxe(dictionnary.word), 
			getSyntaxe(dictionnary.definition || ''), // Add fallback empty string
			getSyntaxe(dictionnary.part_of_speech || ''), // Add fallback empty string
			getSyntaxe(dictionnary.pronunciation || ''), // Add fallback empty string
			dictionnary.user_id, 
			dictionnary.session_name, 
			dictionnary.learned !== undefined ? dictionnary.learned : false
		];
		const qtext = `INSERT INTO user_dictionnary(
			word_id, 
			word, 
			definition, 
			part_of_speech, 
			pronunciation, 
			user_id, 
			session_name, 
			learned
		) VALUES (
			${this.dv(values[0])}, 
			${this.dv(values[1])}, 
			${this.dv(values[2])}, 
			${this.dv(values[3])}, 
			${this.dv(values[4])}, 
			${this.dv(values[5])}, 
			${this.dv(values[6])}, 
			${this.dv(values[7])}
		)`;
		console.log(qtext);
		pool.query(qtext)
			.then(res => {
				console.log(res);
				dictionnary.word_id = wordId;
				callback(dictionnary);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
			});
	}
	
	UPDATE (dictionnary, callback) {
		const wordId = dictionnary.word_id;
		const values = [
			wordId, 
			getSyntaxe(dictionnary.word),
			getSyntaxe(dictionnary.definition),
			getSyntaxe(dictionnary.part_of_speech),
			getSyntaxe(dictionnary.pronunciation), 
			dictionnary.user_id, 
			dictionnary.session_name, 
			dictionnary.learned !== undefined ? dictionnary.learned : false
		];
		const qtext = `UPDATE user_dictionnary SET 
			word = ${this.dv(values[1])}, 
			definition = ${this.dv(values[2])}, 
			part_of_speech = ${this.dv(values[3])}, 
			pronunciation = ${this.dv(values[4])}, 
			user_id = ${this.dv(values[5])}, 
			session_name = ${this.dv(values[6])}, 
			learned = ${this.dv(values[7])} 
			WHERE word_id = ${this.dv(values[0])}`;
		console.log(qtext);
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0) {
					this.ErrorHandling({
						'code': '_1',
						'id': wordId
					}, callback);
					return; // Early return to prevent double callback
				}
				callback(dictionnary);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
			});
	}
	
	SELECT (criteria, callback) {
		try {
			let qtext = 'SELECT user_dictionnary.word_id as word_id, user_dictionnary.word as word, user_dictionnary.definition as definition, user_dictionnary.part_of_speech as part_of_speech, user_dictionnary.pronunciation as pronunciation, user_dictionnary.user_id as user_id, user_dictionnary.session_name as session_name, user_dictionnary.learned as learned FROM user_dictionnary'; // INNER JOIN HAS_RIGHT ON user_dictionnary.word_id = has_right.word_id INNER JOIN DBAUTHORIZATION ON has_right.authorizationId = dbauthorization.authorizationId
			
			if (criteria && criteria.user_id) {
				console.log('User ID for dictionary query:', criteria.user_id);
				// Use safer approach to add criteria
				qtext = `${qtext} WHERE user_id = ${this.dv(criteria.user_id)}`;
			} else {
				console.log('Warning: No user_id provided for dictionary lookup');
			}
			
			console.log('Final SQL query:', qtext);
			pool.query(qtext)
				.then(res => {
					try {
						let dictionnaries = [];
						if (res && res.rows) {
							res.rows.forEach(item => {
								if (item) {
									dictionnaries.push(new Dictionnary(null, item, null));
								}
							});
						}
						callback(dictionnaries);
					} catch (processingError) {
						console.error('Error processing dictionary results:', processingError);
						this.ErrorHandling({
							code: '_999',
							message: 'Error processing dictionary results',
							error: processingError
						}, callback);
					}
				})
				.catch(err => {
					console.error('Database error in SELECT dictionary:', err);
					this.ErrorHandling(err, callback);
				});
		} catch (error) {
			console.error('Unexpected error in SELECT method:', error);
			this.ErrorHandling({
				code: '_999',
				message: 'Unexpected error in SELECT method',
				error: error
			}, callback);
		}
	}

	DELETE (dictionnary, callback) {
		const qtext = 'DELETE FROM user_dictionnary WHERE word_id = $1';
		const wordId = dictionnary.word_id;
		const values = [wordId];
		console.log(values);
		pool.query(qtext, values)
			.then(res => {
				if (res.rowCount === 0) {
					this.ErrorHandling({
						'code': '_1',
						'id': wordId
					}, callback);
					return; // Early return to prevent double callback
				}
				callback(res);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
			});
	}

	// DICTIONNARY DAO : private methods

}

module.exports = DictionnaryDao;
