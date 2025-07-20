const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();

function issueJWTVerification(user) {
  const _email = user.user_email_address;

  const expiresIn = process.env.EXPIRE_TIME_TOKEN;

  const payload = {
    sub: _email,
    iat: Date.now()
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiresIn, algorithm: 'HS256' });

  return {
    token: signedToken,
    expires: expiresIn
  }
}

module.exports = issueJWTVerification;