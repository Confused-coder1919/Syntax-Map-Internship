const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const UserService = require('../modules/Ressources.User/UserService');

// Default secret for development only - will be overridden by environment variables in production
const DEFAULT_SECRET = 'syntax_backend_development_secret_key_do_not_use_in_production';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET || DEFAULT_SECRET,
  algorithms: ['HS256']
 };
 
 // Check if user is connected
 const strategy_connected = new JwtStrategy(options, (payload, done) => {
   console.log(`Payload received in strategy_connected: ${JSON.stringify(payload)}`);
   var userService = new UserService();
   const criteria = {
     user_id: payload.sub
   };
   userService.SELECT(criteria, (user) => {
     if (user) {
       // Enhance user object with role information properly
       if (Array.isArray(user) && user.length > 0) {
         // Get the database role (this is authoritative)
         const dbUserRole = parseInt(user[0].user_role);
         console.log(`⭐ Database role for user ${user[0].user_id}: ${dbUserRole}`);
         
         // Get the token role if available
         if (payload.authorization !== undefined) {
           const tokenRole = parseInt(payload.authorization);
           console.log(`⭐ Token role for user ${user[0].user_id}: ${tokenRole}`);
           console.log(`⭐ Token data: ${JSON.stringify(payload)}`);
         }
         
         // Log full user object for debugging
         console.log(`⭐ Full user object: ${JSON.stringify(user[0], null, 2)}`);
         
         // ALWAYS use the database role as the primary authorization role
         // Ensure it's properly set in both places for consistency
         user[0].authorization = dbUserRole;
         user[0].user_role = dbUserRole;
         
         console.log(`⭐ FINAL ROLE VALUES:`);
         console.log(`   authorization: ${user[0].authorization}`);
         console.log(`   user_role: ${user[0].user_role}`);
       }
       return done(null, user);
     } else {
       return done(null, false);
     }
   });
 });

 // Check if user exist
 const strategy_password = new JwtStrategy(options, (payload, done) =>{
	var userService = new UserService();
	const criteria = {
		user_email_address: payload.sub
	};
	userService.SELECT(criteria, (user) => {
		if (user) {
			// Enhance user object with token information
			if (Array.isArray(user) && user.length > 0) {
				// Get the database role (this is authoritative)
				const dbUserRole = parseInt(user[0].user_role);
				console.log(`⭐ [strategy_password] Database role: ${dbUserRole}`);
				
				// Store token role if available
				if (payload.authorization !== undefined) {
					const tokenRole = parseInt(payload.authorization);
					console.log(`⭐ [strategy_password] Token role: ${tokenRole}`);
					
					// Store token role for reference
					user[0]._token_role = tokenRole;
				}
				
				// ALWAYS use the database role as the primary authorization role
				user[0].authorization = dbUserRole;
				
				console.log(`⭐ [strategy_password] FINAL AUTHORIZATION VALUE: ${user[0].authorization}`);
			}
			return done(null, user);
		} else {
			return done(null, false);
		}
	});
 });

module.exports = (passport) => {
	passport.use('user_connected', strategy_connected);
	passport.use('user_exist', strategy_password);
}