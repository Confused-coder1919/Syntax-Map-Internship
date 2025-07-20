// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import course ressources
const Course = require('./Course.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js')

class CourseDao extends InterfaceDao {

	constructor () {
		super()
	}

	// COURSE DAO : Public methods

	INSERT (course, callback) {
		console.log('COURSE_DAO')
		// Ensure course_data is set with a default value if undefined
		const courseData = course.course_data || '';
		const courseTitle = course.course_title || '';
		const courseImage = course.course_image || '';
		const courseItem = course.course_item || '';
		
		// Process course_data - stringify JSON objects for database storage
		let processedCourseData;
		if (typeof courseData === 'object' && courseData !== null) {
			processedCourseData = JSON.stringify(courseData);
		} else {
			processedCourseData = courseData;
		}
		
		// Directly escape single quotes in SQL string instead of using getSyntaxe
		const escapedCourseData = processedCourseData.replace(/'/g, "''");
		
		// Use RETURNING * to get all data including the generated course_id
		const qtext = `INSERT INTO course_table(course_title, course_data, course_image, course_item) 
		               VALUES (${this.dv(courseTitle)}, '${escapedCourseData}', ${this.dv(courseImage)}, ${this.dv(courseItem)})
		               RETURNING *`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				// Set the generated course_id from the database response
				if (res.rows && res.rows.length > 0) {
					const dbCourse = res.rows[0];
					
					// Create a plain object with parsed JSON data
					const courseObject = {
						course_id: dbCourse.course_id,
						course_title: dbCourse.course_title || '',
						course_image: dbCourse.course_image || '',
						course_item: dbCourse.course_item || '',
						hide: dbCourse.hide || false
					};
					
					// Parse the course_data if it's a JSON string
					try {
						if (typeof dbCourse.course_data === 'string' && dbCourse.course_data.trim()) {
							courseObject.course_data = JSON.parse(dbCourse.course_data);
						} else {
							courseObject.course_data = dbCourse.course_data || '';
						}
					} catch (e) {
						// If parsing fails, keep the original string
						courseObject.course_data = dbCourse.course_data || '';
					}
					
					// Use a unique log message for easier identification
					console.log("=== SUCCESSFULLY CREATED COURSE WITH DATA:", courseObject);
					console.log("=== RETURNING COURSE OBJECT WITH PARSED JSON:", JSON.stringify(courseObject));
					
					// Return the plain object with parsed JSON for better console display
					callback(courseObject);
				} else {
					callback(course);
				}
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
			});
	}

	UPDATE (course, callback) {
		const courseId = course.course_id;
		const courseTitle = course.course_title || '';
		const courseData = course.course_data || '';
		const courseImage = course.course_image || '';
		const courseItem = course.course_item || '';
		const courseHide = course.hide !== undefined ? course.hide : false;
		
		// Process course_data - stringify JSON objects for database storage
		let processedCourseData;
		if (typeof courseData === 'object' && courseData !== null) {
			processedCourseData = JSON.stringify(courseData);
		} else {
			processedCourseData = courseData;
		}
		
		// Directly escape single quotes in SQL string instead of using getSyntaxe
		const escapedCourseData = processedCourseData.replace(/'/g, "''");
		
		const values = [courseId, courseTitle, escapedCourseData, courseImage, courseItem, courseHide];
		const qtext = `UPDATE course_table SET course_title = ${this.dv(values[1])}, course_data = '${escapedCourseData}', course_image = ${this.dv(values[3])}, course_item = ${this.dv(values[4])}, hide = ${this.dv(values[5])} WHERE course_id = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0) {
					this.ErrorHandling({
						'code': '_1',
						'id': courseId
					}, callback);
					return;
				}
				
				// Create a response object with parsed JSON data
				const updatedCourse = {
					course_id: courseId,
					course_title: courseTitle,
					course_image: courseImage,
					course_item: courseItem,
					hide: courseHide
				};
				
				// Parse the course_data if it was a JSON string
				try {
					if (typeof processedCourseData === 'string' && processedCourseData.trim()) {
						updatedCourse.course_data = JSON.parse(processedCourseData);
					} else {
						updatedCourse.course_data = courseData;
					}
				} catch (e) {
					// If parsing fails, keep the original data
					updatedCourse.course_data = courseData;
				}
				
				callback(updatedCourse);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
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
				
				// Process each row to parse JSON data
				res.rows.forEach(item => {
					// Parse course_data if it's a JSON string
					if (typeof item.course_data === 'string' && item.course_data.trim()) {
						try {
							item.course_data = JSON.parse(item.course_data);
						} catch (e) {
							// If parsing fails, keep as string
							console.log("Failed to parse JSON for course_id:", item.course_id);
						}
					}
					
					// Create course objects with parsed data
					courses.push(new Course(null, item, null));
				});
				
				callback(courses);
			})
			.catch(err => {
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
