// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import user ressources
const Dictionnary = require('./Dictionnary.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js')

// import syntaxe
const getSyntaxe = require("../../parser/syntaxePostgres.js")

class DictionnaryDao extends InterfaceDao {

	constructor () {
		super()
	}

	// DICTIONNARY DAO : Public methods

	INSERT (dictionnary, callback) {
		console.log('DICTIONNARY_DAO')
		const wordId = "DEFAULT";//uuidv4()
		const values = [wordId, getSyntaxe(dictionnary.word), dictionnary.user_id, dictionnary.session_name];
		const qtext = `INSERT INTO user_dictionnary(word_id, word, user_id, session_name) VALUES (${this.dv(values[0])}, ${this.dv(values[1])}, ${this.dv(values[2])}, ${this.dv(values[3])})`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				dictionnary.word_id = wordId;
				callback(dictionnary);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//callback(null);
			});
	}

	UPDATE (dictionnary, callback) {
		const wordId = dictionnary.word_id;
		const values = [wordId, getSyntaxe(dictionnary.word), dictionnary.user_id,dictionnary.session_name];
		const qtext = `UPDATE user_dictionnary SET word = ${this.dv(values[1])}, user_id = ${this.dv(values[2])}, session_name = ${this.dv(values[3])} WHERE word_id = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': wordId
					}, callback);
				callback(dictionnary);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}

	SELECT (criteria, callback) {
		let qtext = 'SELECT user_dictionnary.word_id as word_id, user_dictionnary.word as word, user_dictionnary.user_id as user_id, user_dictionnary.session_name as session_name FROM user_dictionnary'; // INNER JOIN HAS_RIGHT ON user_dictionnary.word_id = has_right.word_id INNER JOIN DBAUTHORIZATION ON has_right.authorizationId = dbauthorization.authorizationId
		if (criteria.user_id)
			qtext = this.actq(qtext, 'user_id', criteria.user_id);
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				let dictionnaries = [];
				res.rows.forEach(item =>
					dictionnaries.push(new Dictionnary(null, item, null))
				)
				//console.log(res.rows);
				callback(dictionnaries);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	DELETE (dictionnary, callback) {
		const qtext = 'DELETE FROM user_dictionnary WHERE word_id = $1';
		const wordId = dictionnary.word_id;
		const values = [wordId];
		console.log(values);
		pool.query(qtext, values)
			.then(res => {
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': wordId
					}, callback);
				callback(res);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	// DICTIONNARY DAO : private methods

}

module.exports = DictionnaryDao;