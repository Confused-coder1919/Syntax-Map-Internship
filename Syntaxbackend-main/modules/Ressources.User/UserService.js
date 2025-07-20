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
	
	// New method to verify OTP
	VERIFY_OTP (user, callback) {
		if (user && user.user_email_address && user.otp_code) {
			this.#userDao.VERIFY_OTP(user, callback);
		} else {
			this.#userDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'Email and OTP code are required'
			}, callback);
		}
	}
	
	// New method to generate a new OTP
	GENERATE_OTP (user, callback) {
		if (user && user.user_email_address) {
			this.#userDao.GENERATE_OTP(user, callback);
		} else {
			this.#userDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'Email address is required'
			}, callback);
		}
	}
	
	// New method to update user role (for admin use)
	UPDATE_ROLE (user, callback) {
		if (user && user.user_id && user.user_role) {
			this.#userDao.UPDATE_ROLE(user, callback);
		} else {
			this.#userDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'User ID and role are required'
			}, callback);
		}
	}

	// New methods for login attempt tracking
	INCREMENT_LOGIN_ATTEMPTS(user, callback) {
		if (user && user.user_email_address) {
			this.#userDao.INCREMENT_LOGIN_ATTEMPTS(user, callback);
		} else {
			this.#userDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'User email is required'
			}, callback);
		}
	}
	
	RESET_LOGIN_ATTEMPTS(user, callback) {
		if (user && user.user_email_address) {
			this.#userDao.RESET_LOGIN_ATTEMPTS(user, callback);
		} else {
			this.#userDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'User email is required'
			}, callback);
		}
	}
	
	CHECK_ACCOUNT_LOCK(user, callback) {
		if (user && user.user_email_address) {
			this.#userDao.CHECK_ACCOUNT_LOCK(user, callback);
		} else {
			this.#userDao.ErrorHandling({
				'code': 'INVALID_REQUEST',
				'message': 'User email is required'
			}, callback);
		}
	}

	DELETE (user, callback) {
		this.#userDao.DELETE(user, callback);
	}

}

module.exports = UserService;
