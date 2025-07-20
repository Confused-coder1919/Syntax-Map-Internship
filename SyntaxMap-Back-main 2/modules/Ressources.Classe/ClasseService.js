const ClasseDao = require('./ClasseDao');
const Classe = require('./Classe');

class ClasseService {

	#classeDao = new ClasseDao();

	constructor () {
	}

	SELECT (criteria, callback) {
		if (criteria) {
		   this.#classeDao.SELECT(criteria, callback);
		} else {
			this.#classeDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	INSERT (bodyNewClasse, callback) {
		if (bodyNewClasse) {
			this.#classeDao.INSERT(bodyNewClasse, callback);
		} else {
			this.#classeDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	UPDATE (classe, callback) {
		this.#classeDao.UPDATE(classe, callback);
	}

	DELETE (classe, callback) {
		this.#classeDao.DELETE(classe, callback);
	}

}

module.exports = ClasseService;
