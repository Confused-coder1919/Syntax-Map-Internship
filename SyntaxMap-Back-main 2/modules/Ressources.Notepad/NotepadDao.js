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
		console.log('NOTEPAD_DAO')
		const noteId = "DEFAULT";//uuidv4()
		const values = [noteId, getSyntaxe(notepad.note), notepad.user_id, notepad.session_name];
		const qtext = `INSERT INTO user_notepad(note_id, note, user_id, session_name) VALUES (${this.dv(values[0])}, ${this.dv(values[1])}, ${this.dv(values[2])}, ${this.dv(values[3])})`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				notepad.note_id = noteId;
				callback(notepad);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//callback(null);
			});
	}

	UPDATE (notepad, callback) {
		const noteId = notepad.note_id;
		const values = [noteId, getSyntaxe(notepad.note), notepad.user_id,notepad.session_name];
		const qtext = `UPDATE user_notepad SET note = ${this.dv(values[1])}, user_id = ${this.dv(values[2])}, session_name = ${this.dv(values[3])} WHERE note_id = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': noteId
					}, callback);
				callback(notepad);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}

	SELECT (criteria, callback) {
		let qtext = 'SELECT user_notepad.note_id as note_id, user_notepad.note as note, user_notepad.user_id as user_id, user_notepad.session_name as session_name FROM user_notepad '; // INNER JOIN HAS_RIGHT ON user_notepad.note_id = has_right.note_id INNER JOIN DBAUTHORIZATION ON has_right.authorizationId = dbauthorization.authorizationId
		if (criteria.user_id)
			qtext = this.actq(qtext, 'user_id', criteria.user_id);
		qtext = qtext + " ORDER BY session_name ASC";
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				let dictionnaries = [];
				res.rows.forEach(item =>
					dictionnaries.push(new Notepad(null, item, null))
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

	DELETE (notepad, callback) {
		const qtext = 'DELETE FROM user_notepad WHERE note_id = $1';
		const noteId = notepad.note_id;
		const values = [noteId];
		console.log(values);
		pool.query(qtext, values)
			.then(res => {
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': noteId
					}, callback);
				callback(res);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	// NOTEPAD DAO : private methods

}

module.exports = NotepadDao;