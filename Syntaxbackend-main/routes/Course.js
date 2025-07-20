const express = require("express");
const router = express.Router();

const pool = require('../config/db_connect.js');

//Get all courses
router.get('/course', (req, res) =>{
	pool.query('select * from course_table')
	.then(result => {
		console.log(result.rows);
		res.send(result.rows);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//get a course from its title
router.get('/course/:title', (req, res) =>{
	pool.query('select * from course_table where course_title = \'' + req.params.title + '\'')
	.then(result => {
		console.log(result.rows);
		res.send(result.rows);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//create a course
router.post('/course', (req, res) =>{
	pool.query('insert into course_table values (\'' +  req.body.course_title + '\',\''+ req.body.course_data + '\')')
	.then(result => {
		console.log(result);
		res.send(result);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//Modify a course from its id
router.put('/course/:id', (req, res)=>{
	pool.query('update course_table set course_title = \'' + req.body.title + '\', course_data = \'' + req.body.data + '\' where id_question = ' + req.params.id)
	.then(result => {
		console.log(result.rows);
		res.send(result.rows);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

module.exports = router