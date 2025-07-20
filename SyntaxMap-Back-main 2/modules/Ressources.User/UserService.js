const UserDao = require('./UserDao.js');

class UserService {

	#userDao = new UserDao();

	constructor () {
	}

	SELECT (criteria, callback) {
		if (criteria) {
		   this.#userDao.SELECT(criteria, callback);
		} else {
			this.#userDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	INSERT (bodyNewUser, callback) {
		if (bodyNewUser) {
			this.#userDao.INSERT(bodyNewUser, callback);
		} else {
			this.#userDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	UPDATE (user, callback) {
		this.#userDao.UPDATE(user, callback);
	}

	UPDATE_right (user, callback) {
		if (user) {
			this.#userDao.UPDATE_right(user, callback);
		} else {
			this.#userDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	UPDATE_password (user, callback) {
		if (user) {
			this.#userDao.UPDATE_password(user, callback);
		} else {
			this.#userDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}
	
	UPDATE_last_session (user, callback) {
		if (user) {
			this.#userDao.UPDATE_last_session(user, callback);
		} else {
			this.#userDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	DELETE (user, callback) {
		this.#userDao.DELETE(user, callback);
	}

}

module.exports = UserService;
