const DictionnaryDao = require('./DictionnaryDao');
const Dictionnary = require('./Dictionnary');

class DictionnaryService {

	#dictionnaryDao = new DictionnaryDao();

	constructor () {
	}

	SELECT (criteria, callback) {
		if (criteria) {
		   this.#dictionnaryDao.SELECT(criteria, callback);
		} else {
			this.#dictionnaryDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	INSERT (bodyNewDictionnary, callback) {
		if (bodyNewDictionnary) {
			this.#dictionnaryDao.INSERT(bodyNewDictionnary, callback);
		} else {
			this.#dictionnaryDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	UPDATE (dictionnary, callback) {
		this.#dictionnaryDao.UPDATE(dictionnary, callback);
	}

	DELETE (dictionnary, callback) {
		this.#dictionnaryDao.DELETE(dictionnary, callback);
	}

}

module.exports = DictionnaryService;
