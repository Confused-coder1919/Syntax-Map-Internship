// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import user ressources
const MistakeQuestion = require('./MistakeQuestion.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js')

// import syntaxe
const getSyntaxe = require("../../parser/syntaxePostgres.js")

class MistakeQuestionDao extends InterfaceDao {

	constructor () {
		super()
	}

	// MISTAKEQUESTION DAO : Public methods

	INSERT (mistake, callback) {
		console.log('MISTAKEQUESTION_DAO')
		const mistakeId = "DEFAULT";//uuidv4()
		const values = [mistakeId, mistake.questions_wrong_id, mistake.user_id, mistake.session_name];
		const qtext = `INSERT INTO user_mistake(mistake_id, questions_wrong_id, user_id, session_name) VALUES (${this.dv(values[0])}, ${this.dv(values[1])}, ${this.dv(values[2])}, ${this.dv(values[3])})`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				mistake.questions_wrong_id_id = mistakeId;
				callback(mistake);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//callback(null);
			});
	}

	UPDATE (mistake, callback) {
		const mistakeId = mistake.questions_wrong_id_id;
		const values = [mistakeId, mistake.questions_wrong_id, mistake.user_id,mistake.session_name];
		const qtext = `UPDATE user_mistake SET questions_wrong_id = ${this.dv(values[1])}, user_id = ${this.dv(values[2])}, session_name = ${this.dv(values[3])} WHERE mistake_id = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': mistakeId
					}, callback);
				callback(mistake);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}

	SELECT (criteria, callback) {
		let qtext = 'SELECT user_mistake.mistake_id as mistake_id, user_mistake.questions_wrong_id as questions_wrong_id, user_mistake.user_id as user_id, user_mistake.session_name as session_name FROM user_mistake'; // INNER JOIN HAS_RIGHT ON user_mistake.questions_wrong_id_id = has_right.questions_wrong_id_id INNER JOIN DBAUTHORIZATION ON has_right.authorizationId = dbauthorization.authorizationId
		if (criteria.user_id)
			qtext = this.actq(qtext, 'user_id', criteria.user_id);
		qtext += " ORDER BY session_name ASC"
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				let dictionnaries = [];
				res.rows.forEach(item =>
					dictionnaries.push(new MistakeQuestion(null, item, null))
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

	DELETE (mistake, callback) {
		const qtext = 'DELETE FROM user_mistake WHERE mistake_id = $1';
		const mistakeId = mistake.questions_wrong_id_id;
		const values = [mistakeId];
		console.log(values);
		pool.query(qtext, values)
			.then(res => {
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': mistakeId
					}, callback);
				callback(res);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	// MISTAKEQUESTION DAO : private methods

}

module.exports = MistakeQuestionDao;