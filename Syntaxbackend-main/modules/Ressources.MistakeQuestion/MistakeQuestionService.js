const MistakeQuestionDao = require('./MistakeQuestionDao');
const MistakeQuestion = require('./MistakeQuestion');

class MistakeQuestionService {

	#mistakeQuestionDao = new MistakeQuestionDao();

	constructor () {
	}

	SELECT (criteria, callback) {
		if (criteria) {
		   this.#mistakeQuestionDao.SELECT(criteria, callback);
		} else {
			this.#mistakeQuestionDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	INSERT (bodyNewMistakeQuestion, callback) {
		if (bodyNewMistakeQuestion) {
			this.#mistakeQuestionDao.INSERT(bodyNewMistakeQuestion, callback);
		} else {
			this.#mistakeQuestionDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	UPDATE (mistakeQuestion, callback) {
		this.#mistakeQuestionDao.UPDATE(mistakeQuestion, callback);
	}

	DELETE (mistakeQuestion, callback) {
		this.#mistakeQuestionDao.DELETE(mistakeQuestion, callback);
	}

}

module.exports = MistakeQuestionService;
