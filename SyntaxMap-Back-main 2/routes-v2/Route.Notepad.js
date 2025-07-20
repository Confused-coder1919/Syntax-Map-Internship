// import notepad ressources
const Notepad = require('../modules/Ressources.Notepad/Notepad.js');
const NotepadService = require('../modules/Ressources.Notepad/NotepadService.js');

// import decoder jwt
const jwtDecode = require("jwt-decode");

// import passport
//var passport = require('../../config/passport');

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

module.exports = (app) => {
	
var notepadService = new NotepadService();

	//Get all notepad
	app.get('/notepad', (req, res) =>{
		notepadService.SELECT({},(notepads) => {
			if (notepads.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				notepads.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'notepads': results});
			}
		})
	});

	//Get a notepad from a user
	app.get('/notepad/user', (req, res) =>{
		//console.log(req);
		let criteria = {
			user_id:  jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString()
		};
		notepadService.SELECT(criteria,(notepads) => {
			if (notepads.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				notepads.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'notepads': results});
			}
		})
	});

	//Add a notepad
	app.post('/notepad', (req, res) =>{
		//console.log(req.body);
		let bodyNewNotepad = new Notepad(null, null, req.body);
		bodyNewNotepad.user_id = jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString();
		notepadService.INSERT(bodyNewNotepad, (newNotepad) => {
			console.log(newNotepad);
			if (newNotepad.code) {
				res.statusMessage = newNotepad.errorMessage;
				res.status(newNotepad.code).end();
				return;
			} else {
				res.status(200).send({'note_id': newNotepad.id});
			}
		});
	});

	//Modify a notepad
	app.put('/notepad/:id', (req, res) =>{
		let notepad = {
				note_id: req.params.id,
				note: req.body.note,
				course_id: req.body.course_id,
				user_id: jwtDecode(req.get('Authorization').split(' ')[1]).sub.toString(),
				session_name: req.body.session_name
		};
		console.log(req.body);
		notepadService.UPDATE(notepad, (notepads) => {
			if (notepads.code) {
				res.status(406).end();
				return;
			} else {
				//let results = [];
				//notepads.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'notepads': notepads});
			}
		})
	});

	// Delete a notepad
	app.delete('/notepad/:id', (req, res)=> {
		let notepad = {
			notepad_id: req.params.id
		}
		notepadService.DELETE(notepad, (notepads) => {
			res.status(200).json({'notepads': notepads});
		});
	});
}