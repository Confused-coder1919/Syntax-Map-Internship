console.log("Route.Question.js loaded");

// import question ressources
const Question = require('../modules/Ressources.Question/Question.js');
const QuestionService = require('../modules/Ressources.Question/QuestionService.js');

// import passport
//var passport = require('../../config/passport');

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

module.exports = (app) => {
	
var questionService = new QuestionService();

	//Get all Questions
	app.get('/quiz', (req, res) =>{
		let criteria = {
			order: "ASC",
			by: "question_id"
		};
		questionService.SELECT(criteria,(questions) => {
			if (questions.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				questions.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'questions': results});
			}
		})
	});

	//Add a question
	app.post('/quiz', (req, res) =>{
		let bodyNewQuestion = new Question(null, null, req.body);
		questionService.INSERT(bodyNewQuestion, (newQuestion) => {
			console.log(newQuestion);
			if (newQuestion.code) {
				res.statusMessage = newQuestion.errorMessage;
				res.status(newQuestion).end();
				return;
			} else {
				res.status(200).json({'msg': newQuestion.question_title});
			}
		});
	});

	//Get a quizz of n questions from a course title
	app.post('/quiz/:course', (req, res) =>{
		// TODO add algo

		let criteria = {
				difficulty: '1',
				online_exam_ids: req.body.online_exam_ids,
				limit: req.body.nb_questions,
				order: 'random'
		};
		questionService.SELECT(criteria,(questions) => {
			if (questions.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				questions.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'questions': results});
			}
		})
	});
	
	//Get questions from an array of id
	app.post('/questions/notepad', (req, res) =>{
		console.log(req.body);
		let criteria = {
				question_ids: req.body.question_ids
		};
		questionService.SELECT(criteria,(questions) => {
			if (questions.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				questions.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'questions': results});
			}
		})
	});
	
	//Flag error a question
	app.put('/report_question', (req, res) =>{
		let question = {
				question_title: req.body.question_title,
				verifed: true
		};
		questionService.UPDATE_verified(question,(questions) => {
			if (questions.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				questions.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'questions': results});
			}
		})
	});

	//Modify a question
	app.put('/quiz/:id', (req, res) =>{
		let question = {
				question_id: req.params.id,
				question_title: req.body.question_title,
				answer_title_a: req.body.answer_title_a,
				answer_title_b: req.body.answer_title_b,
				answer_title_c: req.body.answer_title_c,
				answer_title_d: req.body.answer_title_d,
				right_answer: req.body.right_answer,
				difficulty: req.body.difficulty,
				online_exam_ids: req.body.online_exam_ids
		};
		questionService.UPDATE(question,(questions) => {
			if (questions.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				questions.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'questions': results});
			}
		})
	});
	// Delete a question
	app.delete('/quiz/:id', (req, res)=> {
		let quiz = {
			question_id: req.params.id
		}
		questionService.DELETE(quiz, (quiz) => {
			res.status(200).json({'questions': quiz});
		});
	});
}