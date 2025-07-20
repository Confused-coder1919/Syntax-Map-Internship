// import classe ressources
const Classe = require('../modules/Ressources.Classe/Classe.js');
const ClasseService = require('../modules/Ressources.Classe/ClasseService.js');

// import decoder jwt
const jwtDecode = require("jwt-decode");

// import passport
//var passport = require('../../config/passport');

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

module.exports = (app) => {
	
var classeService = new ClasseService();

	//Get all classe
	app.get('/classe', (req, res) =>{
		classeService.SELECT({},(classes) => {
			if (!classes) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				classes.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'classes': results});
			}
		})
	});

	//Get a classe from a user
	app.get('/classe/user', (req, res) =>{
		//console.log(req);
		let criteria = {
			professor_id:  jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString()
		};
		classeService.SELECT(criteria,(classes) => {
			if (!classes) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				classes.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'classes': results});
			}
		})
	});

	//Add a classe
	app.post('/classe', (req, res) =>{
		//console.log(req.body);
		let bodyNewClasse = new Classe(null, null, req.body);
		bodyNewClasse.professor_id = jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString();
		classeService.INSERT(bodyNewClasse, (newClasse) => {
			console.log(newClasse);
			if (newClasse.code) {
				res.statusMessage = newClasse.errorMessage;
				res.status(newClasse.code).end();
				return;
			} else {
				res.status(200).send(newClasse.id);
			}
		});
	});

	//Modify a classe
	app.put('/classe/:id', (req, res) =>{
		let classe = {
				classe_id: req.params.id,
				classe_name: req.body.classe_name,
				students_id: req.body.students_id,
				professor_id: req.body.professor_id
		};
		console.log(req.body);
		classeService.UPDATE(classe, (classes) => {
			if (!classes) {
				res.status(406).end();
				return;
			} else {
				//let results = [];
				//classes.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'classes': classes});
			}
		})
	});

	// Delete a classe
	app.delete('/classe/:id', (req, res)=> {
		let classe = {
			classe_id: req.params.id
		}
		classeService.DELETE(classe, (classes) => {
			res.status(200).json({'classes': classes});
		});
	});
}