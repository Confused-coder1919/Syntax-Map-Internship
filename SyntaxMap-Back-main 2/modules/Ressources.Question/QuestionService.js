const QuestionDao = require('./QuestionDao');
const Question = require('./Question');

class QuestionService {

	#questionDao = new QuestionDao();

	constructor () {
	}

	SELECT (criteria, callback) {
		if (criteria) {
		   this.#questionDao.SELECT(criteria, callback);
		} else {
			this.#questionDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	INSERT (bodyNewQuestion, callback) {
		if (bodyNewQuestion) {
			this.#questionDao.INSERT(bodyNewQuestion, callback);
		} else {
			this.#questionDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}
	
	UPDATE (question, callback) {
		this.#questionDao.UPDATE(question, callback);
	}
	
	UPDATE_verified (question, callback) {
		this.#questionDao.UPDATE_verified(question, callback);
	}

	DELETE (question, callback) {
		this.#questionDao.DELETE(question, callback);
	}

}

module.exports = QuestionService;
