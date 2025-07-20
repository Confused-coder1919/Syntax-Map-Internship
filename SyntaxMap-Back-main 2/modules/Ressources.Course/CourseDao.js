// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import course ressources
const Course = require('./Course.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js')

// import syntaxe
const getSyntaxe = require("../../parser/syntaxePostgres.js")

class CourseDao extends InterfaceDao {

	constructor () {
		super()
	}

	// COURSE DAO : Public methods

	INSERT (course, callback) {
		console.log('COURSE_DAO')
		const courseId = "DEFAULT";//uuidv4()
		const values = [courseId, course.course_title, getSyntaxe(course.course_data), course.course_image, course.course_item];
		const qtext = `INSERT INTO course_table(course_id, course_title, course_data, course_image, course_item) VALUES (${this.dv(values[0])}, ${this.dv(values[1])}, ${this.dv(values[2])}, ${this.dv(values[3])}, ${this.dv(values[4])})`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				course.course_id = courseId;
				callback(course);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//callback(null);
			});
	}

	UPDATE (course, callback) {
		const courseId = course.course_id;
		const values = [courseId, course.course_title, getSyntaxe(course.course_data), course.course_image, course.course_item, course.hide];
		const qtext = `UPDATE course_table SET course_title = ${this.dv(values[1])}, course_data = ${this.dv(values[2])}, course_image = ${this.dv(values[3])}, course_item = ${this.dv(values[4])}, hide = ${this.dv(values[5])} WHERE course_id = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': courseId
					}, callback);
				callback(course);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}

	SELECT (criteria, callback) {
		let qtext = 'SELECT course_table.course_title as course_title, course_table.course_data as course_data, course_table.course_image as course_image, course_table.course_id as course_id, course_table.course_item as course_item, course_table.hide as hide FROM course_table'; // INNER JOIN HAS_RIGHT ON course_table.course_title = has_right.course_title INNER JOIN DBAUTHORIZATION ON has_right.authorizationId = dbauthorization.authorizationId
		if (criteria.course_title)
			qtext = this.actq(qtext, 'course_title', criteria.course_title);
		if (criteria.course_id)
			qtext = this.actq(qtext, 'course_id', criteria.course_id);
		qtext = qtext + " ORDER BY course_id ASC"
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				let courses = [];
				res.rows.forEach(item =>
					courses.push(new Course(null, item, null))
				)
				//console.log(res.rows);
				callback(courses);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	DELETE (course, callback) {
		const qtext = 'DELETE FROM course_table WHERE course_id = $1';
		const courseId = course.course_id;
		const values = [courseId];
		console.log(values);
		pool.query(qtext, values)
			.then(res => {
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': courseId
					}, callback);
				callback(res);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	// COURSE DAO : private methods

}

module.exports = CourseDao;
