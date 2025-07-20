const UserUploadDao = require('./UserUploadDao');
const UserUpload = require('./UserUpload');

class UserUploadService {

	#userUploadDao = new UserUploadDao();

	constructor () {
	}

	SELECT (criteria, callback) {
		if (criteria) {
		   this.#userUploadDao.SELECT(criteria, callback);
		} else {
			this.#userUploadDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	INSERT (bodyNewUser, callback) {
		if (bodyNewUser) {
			this.#userUploadDao.INSERT(bodyNewUser, callback);
		} else {
			this.#userUploadDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	UPDATE (user, callback) {
		this.#userUploadDao.UPDATE(user, callback);
	}

	UPDATE_right (user, callback) {
		if (user) {
			this.#userUploadDao.UPDATE_right(user, callback);
		} else {
			this.#userUploadDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	DELETE (user, callback) {
		this.#userUploadDao.DELETE(user, callback);
	}

}

module.exports = UserUploadService;
