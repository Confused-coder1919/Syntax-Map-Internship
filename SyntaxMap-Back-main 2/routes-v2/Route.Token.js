// import passport
const passport = require('passport');

module.exports = (app) => {
  // Route to check token validity using passport 'user_exist' strategy
  app.get('/token/check', passport.authenticate('user_exist', { session: false }), (req, res) => {
    // If authentication passes, respond with 200 OK and a JSON confirmation
    res.status(200).json({ message: 'Token is valid' });
  });
};
