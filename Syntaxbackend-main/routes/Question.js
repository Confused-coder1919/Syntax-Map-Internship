const express = require("express");
const router = express.Router();
const getSyntaxe = require("../parser/syntaxePostgres.js")
const pool = require('../config/db_connect.js');

//Get all question
router.get('/quiz', (req, res) =>{
	pool.query('select * from question_table')
	.then(result => {
		console.log(result.rows);
		res.send(result.rows);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//get x question from their theme
router.post('/quiz/:course', (req, res) =>{
	pool.query('select * from question_table where online_exam_id = (select course_id from course_table where course_title = \''+ req.params.course + '\') order by random() limit ' + req.body.nb_questions + ';')
	.then(result => {
		console.log(result.rows);
		res.send(result.rows);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//create a question
router.post('/quiz', (req, res) =>{
	var tmp = req.body.quiz_data[0];
	const shuffledArray = req.body.quiz_data.sort((a, b) => 0.5 - Math.random());
	req.body.quiz_title = getSyntaxe(req.body.quiz_title);
	console.log(req.body);
	pool.query('insert into question_table values (' + req.body.course_ids[0] + ',\'' + req.body.quiz_title + '\',\'' + shuffledArray[0] + '\',\'' + shuffledArray[1] + '\',\'' + shuffledArray[2] + '\',\'' + shuffledArray[3] + '\',\''+ String.fromCharCode(97+shuffledArray.indexOf(tmp)) + '\', 10,' + req.body.difficulty + ',default,\'{'+ req.body.course_ids + '}\')')
	.then(result => {
		console.log(result);
		res.send(result);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//Modify a question from its id
router.put('/quiz/:id', (req, res)=>{
	pool.query('update question_table set question_title = \'' + req.body.title + '\', answer_title_a = \'' + req.body.answer_title_a + '\', answer_title_b = \'' + req.body.answer_title_b + '\', answer_title_c = \'' + req.body.answer_title_c + '\', answer_title_d = \'' + req.body.answer_title_d + '\', right_answer = \'' + req.body.right_answer + '\' where id_question = ' + req.params.id)
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