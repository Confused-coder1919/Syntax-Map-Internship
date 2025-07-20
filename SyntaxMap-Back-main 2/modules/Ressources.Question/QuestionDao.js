// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import user ressources
const Question = require('./Question.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js')

// import syntaxe
const getSyntaxe = require("../../parser/syntaxePostgres.js")

class QuestionDao extends InterfaceDao {

	constructor () {
		super()
	}

	// QUESTION DAO : Public methods

	INSERT (question, callback) {
		console.log('QUESTION_DAO')
		const questionId = "DEFAULT";//uuidv4()
		const values = [questionId, getSyntaxe(question.question_title), getSyntaxe(question.answer_title_a), getSyntaxe(question.answer_title_b), getSyntaxe(question.answer_title_c), getSyntaxe(question.answer_title_d), question.right_answer, question.difficulty, question.online_exam_ids];
		const qtext = `INSERT INTO question_table(question_id, question_title, answer_title_a, answer_title_b, answer_title_c, answer_title_d, right_answer, difficulty, online_exam_ids) VALUES (${this.dv(values[0])}, ${this.dv(values[1])}, ${this.dv(values[2])}, ${this.dv(values[3])}, ${this.dv(values[4])}, ${this.dv(values[5])}, ${this.dv(values[6])}, ${this.dv(values[7])}, ${this.dv(values[8])})`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				question.question_id = questionId;
				callback(question);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//callback(null);
			});
	}

	UPDATE (question, callback) {
		const questionId = question.question_id;
		const values = [questionId, getSyntaxe(question.question_title), getSyntaxe(question.answer_title_a), getSyntaxe(question.answer_title_b), getSyntaxe(question.answer_title_c), getSyntaxe(question.answer_title_d), question.right_answer, question.difficulty, question.online_exam_ids];
		const qtext = `UPDATE question_table SET question_title = ${this.dv(values[1])}, answer_title_a = ${this.dv(values[2])}, answer_title_b = ${this.dv(values[3])}, answer_title_c = ${this.dv(values[4])}, answer_title_d = ${this.dv(values[5])}, right_answer = ${this.dv(values[6])}, difficulty = ${this.dv(values[7])}, online_exam_ids = ${this.dv(values[8])} WHERE question_id = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': questionId
					}, callback);
				callback(question);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}

	UPDATE_verified (question, callback) {
		const values = [getSyntaxe(question.question_title), question.verified];
		const qtext = `UPDATE question_table SET verified = ${this.dv(values[1])} WHERE question_title = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'title': question.question_title
					}, callback);
				callback(question);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}

	SELECT (criteria, callback) {
		let qtext = 'SELECT question_table.question_id as question_id, question_table.question_title as question_title, question_table.answer_title_a as answer_title_a, question_table.answer_title_b as answer_title_b, question_table.answer_title_c as answer_title_c, question_table.answer_title_d as answer_title_d, question_table.right_answer as right_answer, question_table.difficulty as difficulty, question_table.online_exam_ids as online_exam_ids, question_table.verified as verified FROM question_table'; // INNER JOIN HAS_RIGHT ON question_table.question_id = has_right.question_id INNER JOIN DBAUTHORIZATION ON has_right.authorizationId = dbauthorization.authorizationId
		if (criteria.difficulty)
			qtext = this.actq(qtext, 'difficulty', criteria.difficulty);
		if (criteria.online_exam_ids !== undefined)
			qtext = this.actqfa(qtext, 'online_exam_ids', criteria.online_exam_ids, 1);
		if (criteria.question_ids)
			qtext = this.actq(qtext, 'question_id', criteria.question_ids);
		if (criteria.order)
			qtext = this.aotq(qtext, criteria.order , criteria.by);
		if (criteria.limit)
			qtext = this.altq(qtext, criteria.limit);
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				let questions = [];
				res.rows.forEach(item =>
					questions.push(new Question(null, item, null))
				)
				//console.log(res.rows);
				callback(questions);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	DELETE (question, callback) {
		const qtext = 'DELETE FROM question_table WHERE question_id = $1';
		const questionId = question.question_id;
		const values = [questionId];
		console.log(values);
		pool.query(qtext, values)
			.then(res => {
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': questionId
					}, callback);
				callback(res);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	// QUESTION DAO : private methods

}

module.exports = QuestionDao;