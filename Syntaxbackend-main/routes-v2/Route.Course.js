// import course ressources
const Course = require('../modules/Ressources.Course/Course.js');
const CourseService = require('../modules/Ressources.Course/CourseService.js');

// import passport
//var passport = require('../../config/passport');

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

// Import multer for file uploads
const multerConfig = require('../config/multerConfig');
const path = require('path');

module.exports = (app) => {
	
var courseService = new CourseService();

	//Get all course
	app.get('/course', (req, res) =>{
		courseService.SELECT({},(courses) => {
			if (courses.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				courses.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'courses': results});
			}
		})
	});

	//Get a course from its title
	app.get('/course/:title', (req, res) =>{
		//console.log(req);
		let criteria = {
			course_title: req.params.title
		};
		courseService.SELECT(criteria,(courses) => {
			if (courses.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				courses.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'courses': results});
			}
		})
	});

	//Add a course with image upload support
	app.post('/course', multerConfig.any(), (req, res) =>{
		console.log('Raw Request body:', req.body);
		console.log('Files:', req.files);
		
		// Find the first image file from any field
		const imageFile = req.files && req.files.length > 0 ? req.files[0] : null;
		
		// Add the image path to the request body if a file was uploaded
		if (imageFile) {
			req.body.image = path.join('uploads', 'images', imageFile.filename).replace(/\\/g, '/');
		}
		
		console.log('Request body with image path:', req.body);
		
		// Create a new Course object with the updated request body
		let bodyNewCourse = new Course(null, null, req.body);
		
		courseService.INSERT(bodyNewCourse, (courseResponse) => {
			console.log("API received course response:", courseResponse);
			
			if (courseResponse.code) {
				res.statusMessage = courseResponse.errorMessage;
				res.status(courseResponse.code).end();
				return;
			} else {
				// The response is already a plain object, ready for JSON
				res.status(200).json({'course': courseResponse});
			}
		});
	});

	//Modify a course with image upload support
	app.put('/course/:id', multerConfig.any(), (req, res) =>{
		console.log('Update request body:', req.body);
		console.log('Files:', req.files);
		
		// Find the first image file from any field
		const imageFile = req.files && req.files.length > 0 ? req.files[0] : null;
		
		let course = {
			course_id: req.params.id,
			course_title: req.body.course_title || req.body.title || '',
			course_data: req.body.course_data || req.body.data || '',
			course_item: req.body.course_item || req.body.item || '',
			hide: req.body.hide !== undefined ? req.body.hide : false
		};
		
		// If a new image was uploaded, update the image path
		if (imageFile) {
			course.course_image = path.join('uploads', 'images', imageFile.filename).replace(/\\/g, '/');
		} else if (req.body.course_image || req.body.image) {
			// Keep existing image if provided in the body
			course.course_image = req.body.course_image || req.body.image;
		}
		
		console.log('Course update data:', course);
		
		courseService.UPDATE(course, (courses) => {
			if (courses.code) {
				res.status(406).end();
				return;
			} else {
				res.status(200).json({'courses': courses});
			}
		});
	});

	// Delete a course
	app.delete('/course/:id', (req, res)=> {
		let course = {
			course_id: req.params.id
		}
		courseService.DELETE(course, (courses) => {
			res.status(200).json({'courses': courses});
		});
	});
}