const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const UserService = require('../modules/Ressources.User/UserService');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET,
  algorithms: ['HS256']
 };
 
 // Check if user is connected
 const strategy_connected = new JwtStrategy(options, (payload, done) =>{
	var userService = new UserService();
	const criteria = {
		user_id: payload.sub
	};
	userService.SELECT(criteria, (user) => {
		if (user)
			return done(null, user);
		else
			return done(null, false);
	});
 });

 // Check if user exist
 const strategy_password = new JwtStrategy(options, (payload, done) =>{
	var userService = new UserService();
	const criteria = {
		user_email_address: payload.sub
	};
	userService.SELECT(criteria, (user) => {
		if (user)
			return done(null, user);
		else
			return done(null, false);
	});
 });

module.exports = (passport) => {
	passport.use('user_connected', strategy_connected);
	passport.use('user_exist', strategy_password);
}