const CourseDao = require('./CourseDao');
const Course = require('./Course');

class CourseService {

	#courseDao = new CourseDao();

	constructor () {
	}

	SELECT (criteria, callback) {
		if (criteria) {
		   this.#courseDao.SELECT(criteria, callback);
		} else {
			this.#courseDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	INSERT (bodyNewCourse, callback) {
		if (bodyNewCourse) {
			this.#courseDao.INSERT(bodyNewCourse, callback);
		} else {
			this.#courseDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	UPDATE (course, callback) {
		this.#courseDao.UPDATE(course, callback);
	}

	UPDATE_right (course, callback) {
		if (course) {
			this.#courseDao.UPDATE_right(course, callback);
		} else {
			this.#courseDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	DELETE (course, callback) {
		this.#courseDao.DELETE(course, callback);
	}

}

module.exports = CourseService;
