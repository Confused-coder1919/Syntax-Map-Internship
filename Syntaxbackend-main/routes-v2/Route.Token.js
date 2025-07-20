// import passport
const passport = require('passport');

module.exports = (app) => {

	//Get all course
	app.get('/token/check', passport.authenticate('user_exist', { session: false }), (req, res) =>{
			res.status(200);
	});
}