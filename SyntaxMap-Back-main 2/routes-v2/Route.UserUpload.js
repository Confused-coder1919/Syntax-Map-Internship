// import userUpload ressources
const UserUpload = require('../modules/Ressources.UserUpload/UserUpload.js');
const UserUploadService = require('../modules/Ressources.UserUpload/UserUploadService.js');

// import decoder jwt
const jwtDecode = require("jwt-decode");
// import passport
const passport = require('passport');

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

//import multer
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
	console.log('destination storage')
	console.log(file)
    cb(null, 'uploads/images/')
  },
  filename: (req, file, cb) => {
	console.log('filename')
	console.log(file)
    cb(null, file.originalname)
  },
})

const upload = multer()

module.exports = (app) => {
	
var userUploadService = new UserUploadService();

	//Get Every exemple
	app.get('/userupload', passport.authenticate('user_connected', { session: false }), (req, res) =>{
		userUploadService.SELECT({},(userUploads) => {
			if (userUploads.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				if (req.userUpload.authorization === 'admin')
					userUploads.forEach(item => { results.push(item.toObject(true, true, true));})
				else
					userUploads.forEach(item => { if (item.authorization !== 'admin') results.push(item.toObject(false, false, false));})
				res.status(200).json({'userUploads': results});
			}
		})
	});
	
	//User get his exemple
	app.get('/userupload/user/:course', passport.authenticate('user_connected', { session: false }), (req, res) =>{
		let criteria = {
				course_id: req.params.course,
				user_id:  jwtDecode(req.get('Authorization').split(' ')[1]).sub
		};
		userUploadService.SELECT(criteria,(userUploads) => {
			if (userUploads.code) {
				res.status(406).end();
				return;
			} else {
				let results = [];
				userUploads.forEach(item => { results.push(item.toObject(true, true, true));})
				res.status(200).json({'userUploads': results});
			}
		})
	});

	//User upload an new exemple
	app.post('/userupload', passport.authenticate('user_connected', { session: false }), (req, res) =>{
	console.log(req.get('Authorization').split(' ')[1]);
		req.body.user_id = jwtDecode(req.get('Authorization').split(' ')[1]).sub;
		console.log(req.body.user_id);
		let bodyNewUserUpload = new UserUpload(null, null, req.body);
		console.log(bodyNewUserUpload.user_id);
		userUploadService.INSERT(bodyNewUserUpload, (newUserUpload) => {
			console.log(newUserUpload);
			if (newUserUpload.code) {
				res.statusMessage = newUserUpload.errorMessage;
				res.status(newUserUpload.code).end();
				return;
			} else {
				res.status(200).send(newUserUpload.id);
			}
		});
	});
}